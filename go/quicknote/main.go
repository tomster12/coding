package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	if len(os.Args) < 2 {
		printUsage(true)
		return
	}
	switch os.Args[1] {
	case "a":
		handleCmdAdd(false)
	case "ao":
		handleCmdAdd(true)
	case "o":
		handleCmdOpen()
	case "d":
		handleCmdDelete()
	case "l":
		handleCmdList()
	case "show":
		handleCmdShow()
	default:
		if len(os.Args[1]) > 0 {
			fmt.Printf("Unknown command %q\n", os.Args[1])
		}
		printUsage(len(os.Args[1]) == 0)
	}
}

func printUsage(includeTagline bool) {
	if includeTagline {
		fmt.Println("Quicknote is a minimal note taking CLI.")
	}

	fmt.Print(`
Usage:

    qn a  <name> <text>       add note
    qn ao <name> <text>       add note and open
    qn show                   reveal notes folder
    qn o <query>              open notes
    qn d <query>              delete notes
    qn l <query>              list notes

Queries accepts the following:

    (empty)              all notes
    -N                   last N notes (e.g. -5)
    d-N                  notes from the last N days (e.g. d-7)
    d0                   notes from today
    DD/MM/YYYY           notes from a specific date
    <id>                 note by 4-hex-char ID
    <text>               notes fuzzy matching name or text

`)
}

func handleCmdAdd(open bool) {
	name := ""
	if len(os.Args) >= 3 {
		name = os.Args[2]
	}
	text := ""
	if len(os.Args) > 3 {
		text = strings.Join(os.Args[3:], " ")
	}
	note, err := addNote(name, text)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Printf("Created %s at %s\n", note.ID, note.Path)
	if open {
		openNote(note.Path)
	}
}

func handleCmdOpen() {
	notes, err := queryNotes(os.Args[2:])
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if len(notes) == 0 {
		fmt.Println("no notes")
		return
	}
	if len(notes) == 1 {
		openNote(notes[0].Path)
	} else {
		sortNotesByDate(notes)
		openNotesAggregated(notes)
	}
}

func handleCmdDelete() {
	notes, err := queryNotes(os.Args[2:])
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if len(notes) == 0 {
		fmt.Println("no notes")
		return
	}

	fmt.Printf("Will delete %d note(s):\n", len(notes))
	sortNotesByDate(notes)
	for _, note := range notes {
		fmt.Printf("  %s  %s  %s\n",
			note.ID,
			note.Name,
			note.Date.Format("2006-01-02"),
		)
	}
	fmt.Print("Delete? [y/n] ")

	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	if strings.TrimSpace(strings.ToLower(scanner.Text())) != "y" {
		fmt.Println("cancelled")
		return
	}

	failed := 0
	for _, note := range notes {
		if err := os.Remove(note.Path); err != nil {
			fmt.Fprintf(os.Stderr, "failed to delete %s: %v\n", note.ID, err)
			failed++
		} else {
			fmt.Printf("Deleted %s\n", note.ID)
		}
	}
	if failed > 0 {
		os.Exit(1)
	}
}

func handleCmdList() {
	notes, err := queryNotes(os.Args[2:])
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if len(notes) == 0 {
		queryString := strings.Join(os.Args[2:], " ")
		fmt.Printf("No notes found for query: '%s'\n", queryString)
	} else {
		sortNotesByDate(notes)
		const format = "%-4s  %-20s  %-50s  %-10s  %-19s\n"
		fmt.Printf(format,
			"ID",
			"Name",
			"Content",
			"Created",
			"Modified",
		)
		for _, note := range notes {
			fmt.Printf(format,
				note.ID,
				squish(note.Name, 20),
				squish(note.Text, 50),
				note.Date.Format("2006-01-02"),
				note.ModDate.Format("2006-01-02 15:04:05"),
			)
		}
	}
	fmt.Println()
}

func handleCmdShow() {
	revealFolder(getNotesRootDir())
}

func queryNotes(args []string) ([]Note, error) {
	q, err := ParseQuery(args)
	if err != nil {
		return nil, err
	}
	all, err := loadAllNotes()
	if err != nil {
		return nil, err
	}
	return q.Apply(all), nil
}

func squish(s string, maxLen int) string {
	s = strings.Join(strings.Fields(s), " ")
	if len(s) <= (maxLen - 3) {
		return s
	}
	return s[:(maxLen-3)] + "..."
}
