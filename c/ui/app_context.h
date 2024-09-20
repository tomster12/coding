#pragma once

#include <windows.h>

#define MAX_BUFFER 256
#define MAX_MESSAGES 100

struct AppContext
{
    HANDLE hConsole;
    char *messages[MAX_MESSAGES];
    int messages_count;
    int to_update_messages;
    int to_clear_input;
    int to_exit;
    HANDLE ui_mutex;
};

struct AppContext *new_app_context();
void free_app_context(struct AppContext *ctx);
void add_user_message(struct AppContext *ctx, const char *message);
