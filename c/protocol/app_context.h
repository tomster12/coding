#pragma once

#include <windows.h>

#define MAX_BUFFER 256
#define MAX_MESSAGES 100

typedef struct _AppContext
{
    HANDLE h_console;
    char *messages[MAX_MESSAGES];
    int messages_count;
    int to_update_messages;
    int to_clear_input;
    int to_exit;
    HANDLE ui_mutex;
} AppContext;

AppContext *app_context_new();
void app_context_free(AppContext *ctx);
