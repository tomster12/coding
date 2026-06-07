package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
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
		fmt.Printf("Unknown command '%s'\n", os.Args[1])
		printUsage()
	}
}

func printUsage() {
	fmt.Println("")
	fmt.Println("qn a  <name> <text>   add note")
	fmt.Println("qn ao <name> <text>   add note and open")
	fmt.Println("| <name> and <text> is optional.")
	fmt.Println("| Using '.' for <name> will be treated as empty.")
	fmt.Println("")
	fmt.Println("qn o <args>           open notes")
	fmt.Println("qn d <args>           delete notes")
	fmt.Println("qn l <args>           list notes")
	fmt.Println("| Where <args> is one of the following:")
	fmt.Println("|- qn .. -5              last 5 notes")
	fmt.Println("|- qn .. dd/MM/yyyy      notes from date")
	fmt.Println("|- qn .. <id>            note by ID")
	fmt.Println("|- qn .. <text>          notes matching text")
	fmt.Println("|- qn .. <empty>         all notes")
	fmt.Println("")
	fmt.Println("qn show 			   reveal folder")
	fmt.Println("")
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
	notes, err := loadNotesFromArgs()
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
		sortNotes(notes)
		openNotesAggregated(notes)
	}
}

func handleCmdDelete() {
	notes, err := loadNotesFromArgs()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if len(notes) == 0 {
		fmt.Println("no notes")
		return
	}
	fmt.Printf("Will delete %d note(s):\n", len(notes))
	sortNotes(notes)
	for _, note := range notes {
		fmt.Printf(
			"  %s  %-20s  %s\n",
			note.Date.Format("2006-01-02 15:04"),
			note.ID,
			note.Name,
		)
	}
	fmt.Print("Delete? [y/n] ")

	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	answer := strings.TrimSpace(strings.ToLower(scanner.Text()))
	if answer != "y" {
		fmt.Println("cancelled")
		return
	}

	var failed int
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
	notes, err := loadNotesFromArgs()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	sortNotes(notes)
	for _, note := range notes {
		fmt.Printf(
			"%s  %s  %-20s  %s\n",
			note.Date.Format("2006-01-02 15:04"),
			note.ID,
			note.Name,
			firstLine(note.Text),
		)
	}
}

func loadNotesFromArgs() ([]Note, error) {
	if len(os.Args) >= 3 {
		arg := os.Args[2]
		switch {
		case strings.HasPrefix(arg, "-"):
			days, err := strconv.Atoi(arg)
			if err != nil {
				return nil, fmt.Errorf("invalid day offset: %s", arg)
			}
			days = -days
			all, err := loadAllNotes()
			if err != nil {
				return nil, err
			}
			sortNotes(all)
			if len(all) == 0 {
				return []Note{}, nil
			}
			if days < 0 {
				days = 0
			}
			if days > len(all) {
				days = len(all)
			}
			fmt.Printf("")
			return all[:days], nil

		case isDate(arg):
			parsed, _ := time.Parse("02/01/2006", arg)
			return loadNotesForDate(parsed)

		case isID(arg):
			note, err := loadNoteByID(arg)
			if err != nil {
				return nil, err
			}
			return []Note{note}, nil

		default:
			all, err := loadAllNotes()
			if err != nil {
				return nil, err
			}
			arg = strings.Join(os.Args[2:], " ")
			filter := strings.ToLower(arg)
			var out []Note
			// If any match exactly only take exact matches
			anyExact := false
			for _, n := range all {
				if n.Name == filter {
					anyExact = true
				}
			}
			for _, n := range all {
				if anyExact == true {
					if n.Name == filter {
						out = append(out, n)
					}
				} else if strings.Contains(strings.ToLower(n.Name), filter) {
					out = append(out, n)
				}
			}
			return out, nil
		}
	}

	// No arg: today
	return loadNotesForDate(time.Now())
}

func handleCmdShow() {
	revealFolder(getNotesRootDir())
}
