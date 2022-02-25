
#MaxThreadsPerHotkey 2

fishToggle = 0
timer = 0


!f::
 	fishToggle := !fishToggle

	if (!fishToggle) {
		toolTip
		return
	}

	While (fishToggle) {
		ToolTip Currently fishing`n-------------------`n Timer: %timer%
		Send `%f
		Send {Enter}
		Sleep 3200
		timer := timer + 3200

		if (timer > 300000) {
			timer := 0
			toolTip
			MsgBox 5m Reminder
			return
		}
	}

	return


!b::
	Send `%buy Fish5m
	Send {Enter}
	Sleep 3200
	Send `%buy Treasure5m
	Send {Enter}
	Sleep 3200
	Send `%buy Auto10m
	Send {Enter}

	return

!g::
	timer := 0
	MsgBox Reset timer

	return