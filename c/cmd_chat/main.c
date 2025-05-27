// cbuild: app_context.c render_thread.c input_thread.c listener_thread.c -lws2_32

#include <windows.h>
#include <stdio.h>
#include "app_context.h"
#include "render_thread.h"
#include "input_thread.h"
#include "listener_thread.h"

int main(void)
{
    int exit_code = 0;

    AppContext *app_ctx = app_context_new();
    if (app_ctx == NULL) {
        fprintf(stderr, "Failed to create app context.\n");
        exit_code = 1;
        goto cleanup;
    }

    WSADATA wsa_data;
    BOOL wsa_started = FALSE;
    if (WSAStartup(MAKEWORD(2, 2), &wsa_data) != 0) {
        fprintf(stderr, "WSAStartup failed. Error: %lu\n", GetLastError());
        exit_code = 1;
        goto cleanup;
    }
    wsa_started = TRUE;

    HANDLE render_tid = CreateThread(NULL, 0, render_thread, app_ctx, 0, NULL);
    if (render_tid == NULL) {
        fprintf(stderr, "Failed to create render thread. Error: %lu\n", GetLastError());
        exit_code = 1;
        goto cleanup;
    }

    HANDLE input_tid = CreateThread(NULL, 0, input_thread, app_ctx, 0, NULL);
    if (input_tid == NULL) {
        fprintf(stderr, "Failed to create input thread. Error: %lu\n", GetLastError());
        exit_code = 1;
        goto cleanup;
    }

    HANDLE listener_tid = CreateThread(NULL, 0, listener_thread, app_ctx, 0, NULL);
    if (listener_tid == NULL) {
        fprintf(stderr, "Failed to create listener thread. Error: %lu\n", GetLastError());
        exit_code = 1;
        goto cleanup;
    }

    WaitForSingleObject(render_tid, INFINITE);
    WaitForSingleObject(input_tid, INFINITE);
    WaitForSingleObject(listener_tid, INFINITE);

cleanup:
    if (render_tid) CloseHandle(render_tid);
    if (input_tid) CloseHandle(input_tid);
    if (listener_tid) CloseHandle(listener_tid);
    if (app_ctx) app_context_free(app_ctx);
    if (wsa_started) WSACleanup();

    return exit_code;
}
