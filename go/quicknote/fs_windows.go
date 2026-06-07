//go:build windows

package main

import (
	"os/exec"
)

func openNote(path string) {
	openInEditor(path)
}

func openFileInDefault(path string) {
	_ = exec.Command("cmd", "/c", "start", "", path).Run()
}

func openInEditor(path string) {
	_ = exec.Command("cmd", "/c", "code", path).Run()
}

func revealFolder(path string) {
	_ = exec.Command("explorer", path).Run()
}
