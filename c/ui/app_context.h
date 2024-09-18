#pragma once

#include <windows.h>

#define MAX_BUFFER 256
#define MAX_MESSAGES 100

struct AppContext
{
    HANDLE hConsole;
    char input_buffer[MAX_BUFFER];
    char *history[MAX_MESSAGES];
    int history_count;
    int to_update;
    HANDLE ui_mutex;
};

struct AppContext *new_app_context();
void free_app_context(struct AppContext *ctx);
