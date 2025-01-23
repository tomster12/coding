#include <windows.h>
#include <stdio.h>
#include "app_context.h"

AppContext *app_context_new()
{
    AppContext *ctx = (AppContext *)malloc(sizeof(AppContext));

    ctx->h_console = GetStdHandle(STD_OUTPUT_HANDLE);
    ctx->messages_count = 0;
    ctx->to_update_messages = 1;
    ctx->to_exit = 0;
    ctx->ui_mutex = CreateMutex(NULL, FALSE, NULL);

    return ctx;
}

void app_context_free(AppContext *ctx)
{
    CloseHandle(ctx->ui_mutex);
    free(ctx);
}
