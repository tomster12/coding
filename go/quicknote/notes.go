package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type Note struct {
	Name string
	Date time.Time
	Path string
	Text string
	ID   string
}

// Notes

func addNote(name, text string) (Note, error) {
	if name == "." {
		name = ""
	}
	now := time.Now()
	if err := os.MkdirAll(getNotesRootDir(), 0755); err != nil {
		return Note{}, err
	}
	id, err := newID()
	if err != nil {
		return Note{}, err
	}
	notePath := filepath.Join(getNotesRootDir(), id+".txt")
	content := fmt.Sprintf("date:%s\nname:%s\n%s", now.Format(time.RFC3339), name, text)
	if err := os.WriteFile(notePath, []byte(content), 0644); err != nil {
		return Note{}, err
	}
	return Note{Name: name, Date: now, Path: notePath, Text: text, ID: id}, nil
}

func loadNote(path string) (Note, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return Note{}, err
	}
	lines := strings.Split(string(data), "\n")

	var date time.Time
	if len(lines) > 0 {
		dateStr := strings.TrimPrefix(lines[0], "date:")
		date, _ = time.ParseInLocation(time.RFC3339, dateStr, time.Local)
	}
	if date.IsZero() {
		info, err := os.Stat(path)
		if err != nil {
			return Note{}, err
		}
		date = info.ModTime()
	}

	name := "."
	if len(lines) > 1 {
		name = strings.TrimPrefix(lines[1], "name:")
	}

	text := ""
	if len(lines) > 2 {
		text = strings.TrimSpace(strings.Join(lines[2:], "\n"))
	}

	id := strings.TrimSuffix(filepath.Base(path), ".txt")
	return Note{Name: name, Date: date, Path: path, Text: text, ID: id}, nil
}

func loadNoteByID(id string) (Note, error) {
	return loadNote(filepath.Join(getNotesRootDir(), id+".txt"))
}

func loadAllNotes() ([]Note, error) {
	entries, err := os.ReadDir(getNotesRootDir())
	if os.IsNotExist(err) {
		return []Note{}, nil
	}
	if err != nil {
		return nil, err
	}
	var notes []Note
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".txt" {
			continue
		}
		note, err := loadNote(filepath.Join(getNotesRootDir(), entry.Name()))
		if err == nil {
			notes = append(notes, note)
		}
	}
	return notes, nil
}

func loadNotesForDate(day time.Time) ([]Note, error) {
	all, err := loadAllNotes()
	if err != nil {
		return nil, err
	}
	target := day.Format("2006-01-02")
	var out []Note
	for _, n := range all {
		if n.Date.Format("2006-01-02") == target {
			out = append(out, n)
		}
	}
	return out, nil
}

func loadNotesAfterDate(day time.Time) ([]Note, error) {
	all, err := loadAllNotes()
	if err != nil {
		return nil, err
	}
	target := day.Format("2006-01-02")
	var out []Note
	for _, n := range all {
		if n.Date.Format("2006-01-02") >= target {
			out = append(out, n)
		}
	}
	return out, nil
}

func openNotesAggregated(notes []Note) {
	var b strings.Builder

	fmt.Fprintf(&b, "!! This is an aggregated view over %d notes. Edits will not be saved.\n\n", len(notes))

	for _, note := range notes {
		b.WriteString("----------------------------")
		b.WriteString("\n")
		b.WriteString(note.Date.Format(time.RFC3339))
		b.WriteString("\n")
		b.WriteString(note.Name)
		b.WriteString("\n")
		b.WriteString(note.Text)
		b.WriteString("\n")
	}
	b.WriteString("----------------------------")
	tmp := filepath.Join(os.TempDir(), "quicknote-view.txt")
	if err := os.WriteFile(tmp, []byte(b.String()), 0644); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	openNote(tmp)
}

func sortNotes(notes []Note) {
	sort.Slice(notes, func(i, j int) bool {
		return notes[i].Date.After(notes[j].Date)
	})
}

func getNotesRootDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	return filepath.Join(home, ".quicknote")
}

func newID() (string, error) {
	root := getNotesRootDir()
	for range 10 {
		b := make([]byte, 2) // 2 bytes = 4 hex chars
		if _, err := rand.Read(b); err != nil {
			return "", err
		}
		id := hex.EncodeToString(b)
		if _, err := os.Stat(filepath.Join(root, id+".txt")); os.IsNotExist(err) {
			return id, nil
		}
	}
	return "", fmt.Errorf("could not generate unique note ID after 10 attempts")
}

func isID(s string) bool {
	if len(s) != 4 {
		return false
	}
	for _, c := range s {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f')) {
			return false
		}
	}
	return true
}

// Utility

func matches(note Note, filter string) bool {
	name := strings.ToLower(note.Name)
	text := strings.ToLower(note.Text)
	return strings.Contains(name, filter) ||
		strings.Contains(text, filter) ||
		fuzzyContains(name, filter)
}

func fuzzyContains(s, pattern string) bool {
	j := 0
	for i := 0; i < len(s) && j < len(pattern); i++ {
		if s[i] == pattern[j] {
			j++
		}
	}
	return j == len(pattern)
}

func firstLine(s string) string {
	line, err := io.ReadAll(io.LimitReader(strings.NewReader(s), 80))
	if err != nil {
		return ""
	}
	text := strings.Split(string(line), "\n")[0]
	if len(text) > 60 {
		return text[:60] + "..."
	}
	return text
}

func isDate(s string) bool {
	_, err := time.Parse("02/01/2006", s)
	return err == nil
}
