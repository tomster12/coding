// build: app_context.c render_thread.c input_thread.c listener_thread.c -lws2_32

#include <windows.h>
#include <stdio.h>
#include "app_context.h"
#include "render_thread.h"
#include "input_thread.h"
#include "listener_thread.h"

int main()
{
    struct AppContext *ctx = new_app_context();

    // Start Winsock
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
    {
        printf("WSAStartup failed.\n");
        exit(1);
    }

    // Start render thread
    HANDLE render_tid = CreateThread(NULL, 0, render_thread, ctx, 0, NULL);
    if (!render_tid)
    {
        printf("Failed to create render thread.\n");
        exit(1);
    }

    // Start input thread
    HANDLE input_tid = CreateThread(NULL, 0, input_thread, ctx, 0, NULL);
    if (!input_tid)
    {
        printf("Failed to create input thread.\n");
        exit(1);
    }

    // Start listener thread
    HANDLE listener_tid = CreateThread(NULL, 0, listener_thread, ctx, 0, NULL);
    if (!listener_tid)
    {
        printf("Failed to create listener thread.\n");
        exit(1);
    }

    WaitForSingleObject(render_tid, INFINITE);
    WaitForSingleObject(input_tid, INFINITE);
    WaitForSingleObject(listener_tid, INFINITE);

    CloseHandle(render_tid);
    CloseHandle(input_tid);
    CloseHandle(listener_tid);

    free_app_context(ctx);

    WSACleanup();

    return 0;
}
