#pragma once

#include <windows.h>

void move_cursor_to(int x, int y);
DWORD WINAPI render_thread(LPVOID arg);
