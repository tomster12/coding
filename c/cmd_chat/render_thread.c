#include <windows.h>
#include <stdio.h>
#include "constants.h"
#include "render_thread.h"
#include "app_context.h"

void move_cursor_to(int x, int y)
{
    COORD coord = {x, y};
    SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
}

void init_render_window()
{
    system("cls");

    printf("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n");
    printf("┃                    Text Chat                ┃\n");
    printf("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n");

    for (int i = 0; i < MESSAGE_LIST_HEIGHT; i++)
    {
        printf("                                               \n");
    }

    printf("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n");
    printf("┃ >                                           ┃\n");
    printf("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n");

    move_cursor_to(4, MESSAGE_LIST_HEIGHT + 4);
}

DWORD WINAPI render_thread(LPVOID arg)
{
    AppContext *ctx = (AppContext *)arg;

    SetConsoleOutputCP(CP_UTF8);

    init_render_window();

    while (1)
    {
        WaitForSingleObject(ctx->ui_mutex, INFINITE);

        if (ctx->to_exit)
        {
            break;
        }

        if (ctx->to_update_messages)
        {
            // Get current cursor position
            CONSOLE_SCREEN_BUFFER_INFO csbi;
            GetConsoleScreenBufferInfo(ctx->h_console, &csbi);

            // Clear message box then write each message
            for (int i = 0; i < MESSAGE_LIST_HEIGHT; i++)
            {
                move_cursor_to(2, 3 + i);
                printf("                                               \n");
            }

            for (int i = 0; i < ctx->messages_count && i < MESSAGE_LIST_HEIGHT; i++)
            {
                move_cursor_to(2, 3 + MESSAGE_LIST_HEIGHT - i - 1);
                printf("%s", ctx->messages[ctx->messages_count - i - 1]);
            }

            // Move cursor back to where it was before
            SetConsoleCursorPosition(ctx->h_console, csbi.dwCursorPosition);

            ctx->to_update_messages = 0;
        }

        if (ctx->to_clear_input)
        {
            move_cursor_to(0, MESSAGE_LIST_HEIGHT + 4);
            printf("┃ >                                           ┃\n");
            move_cursor_to(4, MESSAGE_LIST_HEIGHT + 4);
            ctx->to_clear_input = 0;
        }

        ReleaseMutex(ctx->ui_mutex);

        Sleep(100);
    }

    system("cls");
}
