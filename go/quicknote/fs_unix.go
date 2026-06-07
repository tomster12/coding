//go:build !windows

package main

import (
	"os/exec"
	"runtime"
)

func openNote(path string) {
	openFileInEditor(path)
}

func openFileInDefault(path string) {
	var cmd string
	switch runtime.GOOS {
	case "darwin":
		cmd = "open"
	default:
		cmd = "xdg-open"
	}
	_ = exec.Command(cmd, path).Run()
}

func openFileInEditor(path string) {
	_ = exec.Command("code", path).Run()
}

func revealFolder(path string) {
	var cmd string
	switch runtime.GOOS {
	case "darwin":
		cmd = "open"
	default:
		cmd = "xdg-open"
	}
	_ = exec.Command(cmd, path).Run()
}
