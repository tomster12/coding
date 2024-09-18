#include <windows.h>
#include <stdlib.h>
#include "app_context.h"

struct AppContext *new_app_context()
{
    struct AppContext *ctx = (struct AppContext *)malloc(sizeof(struct AppContext));
    ctx->hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
    ctx->history_count = 0;
    ctx->input_buffer[0] = '\0';
    ctx->to_update = 1;
    ctx->ui_mutex = CreateMutex(NULL, FALSE, NULL);
    return ctx;
}

void free_app_context(struct AppContext *ctx)
{
    CloseHandle(ctx->ui_mutex);
    free(ctx);
}
