#include <windows.h>
#include <stdio.h>
#include "app_context.h"

struct AppContext *new_app_context()
{
    struct AppContext *ctx = (struct AppContext *)malloc(sizeof(struct AppContext));
    ctx->hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
    ctx->messages_count = 0;
    ctx->to_update_messages = 1;
    ctx->to_exit = 0;
    ctx->ui_mutex = CreateMutex(NULL, FALSE, NULL);
    return ctx;
}

void free_app_context(struct AppContext *ctx)
{
    CloseHandle(ctx->ui_mutex);
    free(ctx);
}

void add_user_message(struct AppContext *ctx, const char *message)
{
    WaitForSingleObject(ctx->ui_mutex, INFINITE);

    if (ctx->messages_count < MAX_MESSAGES)
    {
        ctx->messages[ctx->messages_count++] = _strdup(message);
    }

    ctx->to_update_messages = 1;
    ctx->to_clear_input = 1;

    ReleaseMutex(ctx->ui_mutex);
}
