#include <windows.h>
#include <stdio.h>
#include <string.h>
#include "app_context.h"

void move_cursor_to(AppContext *ctx, int x, int y)
{
    COORD coord = {x, y};
    SetConsoleCursorPosition(ctx->h_console, coord);
}

void clear_line(AppContext *ctx, int y)
{
    move_cursor_to(ctx, 0, y);
    printf("                                                                              \r");
}

void render_messages(AppContext *ctx)
{
    int start = ctx->messages_count > MAX_MESSAGES_DISPLAY
                ? ctx->messages_count - MAX_MESSAGES_DISPLAY
                : 0;

    for (int i = 0; i < MAX_MESSAGES_DISPLAY; i++)
    {
        int msg_index = start + i;
        int line = LINE_MESSAGES_START + i;
        if (msg_index < ctx->messages_count)
        {
            clear_line(ctx, line);
            move_cursor_to(ctx, 0, line);
            printf("%s", ctx->messages[msg_index]);
        }
    }
}

void render_input_line(AppContext *ctx)
{
    clear_line(ctx, LINE_INPUT);
    move_cursor_to(ctx, 0, LINE_INPUT);
    printf("> ");
}

DWORD WINAPI render_thread(LPVOID arg)
{
    AppContext *ctx = (AppContext *)arg;

    SetConsoleOutputCP(CP_UTF8);
    system("cls");

    printf("----- CMD Chat -----\n");
    render_input_line(ctx);

    while (1)
    {
        WaitForSingleObject(ctx->ui_mutex, INFINITE);

        if (ctx->to_exit)
        {
            ReleaseMutex(ctx->ui_mutex);
            break;
        }

        if (ctx->to_update_messages)
        {
            CONSOLE_SCREEN_BUFFER_INFO csbi;
            GetConsoleScreenBufferInfo(ctx->h_console, &csbi);
            COORD cursor_pos = csbi.dwCursorPosition;

            render_messages(ctx);

            move_cursor_to(ctx, cursor_pos.X, cursor_pos.Y);

            ctx->to_update_messages = 0;
        }

        if (ctx->to_clear_input)
        {
            render_input_line(ctx);
            ctx->to_clear_input = 0;
        }

        ReleaseMutex(ctx->ui_mutex);
        Sleep(100);
    }

    return 0;
}
