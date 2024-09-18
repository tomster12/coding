// build: render.c app_context.c input.c

#include <windows.h>
#include <stdio.h>
#include "app_context.h"
#include "render.h"
#include "input.h"

int main()
{
    struct AppContext *ctx = new_app_context();

    HANDLE render_tid = CreateThread(NULL, 0, render_thread, ctx, 0, NULL);
    if (!render_tid)
    {
        printf("Failed to create render thread.\n");
        exit(1);
    }

    HANDLE input_tid = CreateThread(NULL, 0, input_thread, ctx, 0, NULL);
    if (!input_tid)
    {
        printf("Failed to create input thread.\n");
        exit(1);
    }

    WaitForSingleObject(render_tid, INFINITE);
    WaitForSingleObject(input_tid, INFINITE);

    CloseHandle(render_tid);
    CloseHandle(input_tid);
    free_app_context(ctx);

    return 0;
}
