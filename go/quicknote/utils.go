package main

import (
	"fmt"
	"strings"
	"time"
)

func fuzzyMatch(note Note, filter string) bool {
	name := strings.ToLower(note.Name)
	text := strings.ToLower(note.Text)
	return strings.Contains(name, filter) ||
		strings.Contains(text, filter) ||
		fuzzySubsequence(name, filter)
}

func fuzzySubsequence(s, pattern string) bool {
	j := 0
	for i := 0; i < len(s) && j < len(pattern); i++ {
		if s[i] == pattern[j] {
			j++
		}
	}
	return j == len(pattern)
}

func startOfDay(t time.Time) time.Time {
	y, m, d := t.Date()
	return time.Date(y, m, d, 0, 0, 0, 0, t.Location())
}

func parsePositiveInt(s string) (int, error) {
	n := 0
	if len(s) == 0 {
		return 0, fmt.Errorf("empty string")
	}
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, fmt.Errorf("not a number")
		}
		n = n*10 + int(c-'0')
	}
	return n, nil
}
