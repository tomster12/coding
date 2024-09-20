#include <stdio.h>
#include <stdlib.h>
#include "input.h"
#include "app_context.h"

DWORD WINAPI input_thread(LPVOID arg)
{
    struct AppContext *ctx = (struct AppContext *)arg;
    char buffer[MAX_BUFFER];

    while (1)
    {
        WaitForSingleObject(ctx->ui_mutex, INFINITE);

        fgets(buffer, MAX_BUFFER, stdin);

        buffer[strcspn(buffer, "\n")] = '\0';

        if (strcmp(buffer, "/exit") == 0)
        {
            ctx->to_exit = 1;
            break;
        }

        add_user_message(ctx, buffer);

        buffer[0] = '\0';

        ReleaseMutex(ctx->ui_mutex);
    }

    return 0;
}
