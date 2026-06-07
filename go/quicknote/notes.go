package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type Note struct {
	ID      string
	Name    string
	Date    time.Time
	ModDate time.Time
	Path    string
	Text    string
}

type QueryKind int

const (
	QueryAll QueryKind = iota
	QueryLastN
	QueryLastDays
	QueryDate
	QueryID
	QueryText
)

type Query struct {
	Kind QueryKind
	N    int
	Date time.Time
	Text string
}

func ParseQuery(args []string) (Query, error) {
	if len(args) == 0 {
		return Query{Kind: QueryAll}, nil
	}
	arg := args[0]

	// -N: Last N notes
	if strings.HasPrefix(arg, "-") {
		n, err := parsePositiveInt(arg[1:])
		if err != nil {
			return Query{}, fmt.Errorf("invalid count %q: expected a positive number", arg)
		}
		return Query{Kind: QueryLastN, N: n}, nil
	}

	// d0 / d-N: Notes from the last N days (d0 = today)
	if arg == "d0" || strings.HasPrefix(arg, "d-") {
		raw := strings.TrimPrefix(arg, "d-")
		if raw == arg { // arg was "d0"
			raw = "0"
		}
		n, err := parsePositiveInt(raw)
		if err != nil {
			return Query{}, fmt.Errorf("invalid day range %q: expected d0 or d-N", arg)
		}
		return Query{Kind: QueryLastDays, N: n}, nil
	}

	// DD/MM/YYYY: Specific date
	if d, err := time.ParseInLocation("02/01/2006", arg, time.Local); err == nil {
		return Query{Kind: QueryDate, Date: d}, nil
	}

	// ID: specific note
	if isNoteID(arg) {
		return Query{Kind: QueryID, Text: arg}, nil
	}

	// Free text: Fuzzy find over notes
	text := strings.Join(args, " ")
	return Query{Kind: QueryText, Text: text}, nil
}

func (q Query) Apply(all []Note) []Note {
	switch q.Kind {

	case QueryAll:
		return filterNotesByDate(all, time.Now())

	case QueryLastN:
		sortNotesByDate(all)
		if q.N > len(all) {
			return all
		}
		return all[:q.N]

	case QueryLastDays:
		cutoff := startOfDay(time.Now()).AddDate(0, 0, -q.N)
		var out []Note
		for _, n := range all {
			if !startOfDay(n.Date).Before(cutoff) {
				out = append(out, n)
			}
		}
		return out

	case QueryDate:
		return filterNotesByDate(all, q.Date)

	case QueryID:
		for _, n := range all {
			if n.ID == q.Text {
				return []Note{n}
			}
		}
		return nil

	case QueryText:
		filter := strings.ToLower(q.Text)
		// Prefer exact name matches; fall back to fuzzy.
		var exact, fuzzy []Note
		for _, n := range all {
			name := strings.ToLower(n.Name)
			switch {
			case name == filter:
				exact = append(exact, n)
			case fuzzyMatch(n, filter):
				fuzzy = append(fuzzy, n)
			}
		}
		if len(exact) > 0 {
			return exact
		}
		return fuzzy
	}
	return nil
}

func addNote(name, text string) (Note, error) {
	if name == "." {
		name = ""
	}
	if err := os.MkdirAll(getNotesRootDir(), 0755); err != nil {
		return Note{}, err
	}
	id, err := newNoteID()
	if err != nil {
		return Note{}, err
	}

	now := time.Now()
	filename := now.Format("02012006") + "-" + id
	if name != "" {
		filename += "-" + name
	}
	notePath := filepath.Join(getNotesRootDir(), filename+".txt")

	if err := os.WriteFile(notePath, []byte(text), 0644); err != nil {
		return Note{}, err
	}

	return Note{ID: id, Name: name, Date: now, Path: notePath, Text: text}, nil
}

func loadNote(path string) (Note, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return Note{}, err
	}

	base := strings.TrimSuffix(filepath.Base(path), ".txt")
	date, id, name := parseNoteFilename(base)

	info, err := os.Stat(path)
	if err != nil {
		return Note{}, err
	}

	return Note{
		ID:      id,
		Name:    name,
		Date:    date,
		ModDate: info.ModTime(),
		Path:    path,
		Text:    strings.TrimSpace(string(data)),
	}, nil
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

func openNotesAggregated(notes []Note) {
	var b strings.Builder
	fmt.Fprintf(&b, "!! Aggregated view of notes, edits will not be saved.\n\n")
	for _, note := range notes {
		fmt.Fprintf(&b, ":: %s\n%s\n\n", filepath.Base(note.Path), note.Text)
	}
	tmp := filepath.Join(os.TempDir(), "quicknote-view.txt")
	if err := os.WriteFile(tmp, []byte(b.String()), 0644); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	openNote(tmp)
}

func sortNotesByDate(notes []Note) {
	sort.Slice(notes, func(i, j int) bool {
		if notes[i].Date.Equal(notes[j].Date) {
			return notes[i].ModDate.After(notes[j].ModDate)
		}
		return notes[i].Date.After(notes[j].Date)
	})
}

func filterNotesByDate(notes []Note, day time.Time) []Note {
	target := day.Format("2006-01-02")
	var out []Note
	for _, n := range notes {
		if n.Date.Format("2006-01-02") == target {
			out = append(out, n)
		}
	}
	return out
}

func parseNoteFilename(base string) (date time.Time, id, name string) {
	parts := strings.SplitN(base, "-", 3)
	if len(parts) >= 2 {
		date, _ = time.ParseInLocation("02012006", parts[0], time.Local)
		id = parts[1]
	}
	if len(parts) == 3 {
		name = parts[2]
	}
	return
}

func getNotesRootDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	return filepath.Join(home, ".quicknote")
}

func newNoteID() (string, error) {
	root := getNotesRootDir()
	for range 10 {
		b := make([]byte, 2)
		if _, err := rand.Read(b); err != nil {
			return "", err
		}
		id := hex.EncodeToString(b)
		matches, _ := filepath.Glob(filepath.Join(root, "*-"+id+"-*.txt"))
		matches2, _ := filepath.Glob(filepath.Join(root, "*-"+id+".txt"))
		matches = append(matches, matches2...)
		if len(matches) == 0 {
			return id, nil
		}
	}
	return "", fmt.Errorf("could not generate a unique note ID after 10 attempts")
}

func isNoteID(s string) bool {
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
