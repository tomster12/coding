#include <stdio.h>
#include <stdlib.h>
#include "input.h"
#include "app_context.h"

DWORD WINAPI input_thread(LPVOID arg)
{
    struct AppContext *ctx = (struct AppContext *)arg;
    int input_index = 0;
    char ch;

    while (1)
    {
        ch = fgetc(stdin);

        if (ch == '\n')
        {
            WaitForSingleObject(ctx->ui_mutex, INFINITE);
            ctx->history[ctx->history_count++] = _strdup(ctx->input_buffer);
            ctx->input_buffer[0] = '\0';
            input_index = 0;
            ctx->to_update = 1;
            ReleaseMutex(ctx->ui_mutex);
        }

        else if (input_index < MAX_BUFFER - 1)
        {
            WaitForSingleObject(ctx->ui_mutex, INFINITE);
            ctx->input_buffer[input_index++] = ch;
            ctx->input_buffer[input_index] = '\0';
            ctx->to_update = 1;
            ReleaseMutex(ctx->ui_mutex);
        }
    }

    return 0;
}
