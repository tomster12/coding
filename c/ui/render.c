#include <windows.h>
#include <stdio.h>
#include "render.h"
#include "app_context.h"

void move_cursor_to(int x, int y)
{
    COORD coord = {x, y};
    SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
}

void clear_console(HANDLE hConsole)
{
    CONSOLE_SCREEN_BUFFER_INFO csbi;
    DWORD length, written;

    GetConsoleScreenBufferInfo(hConsole, &csbi);
    length = csbi.dwSize.X * csbi.dwSize.Y;
    FillConsoleOutputCharacter(hConsole, ' ', length, (COORD){0, 0}, &written);
    SetConsoleCursorPosition(hConsole, (COORD){0, 0});
}

DWORD WINAPI render_thread(LPVOID arg)
{
    struct AppContext *ctx = (struct AppContext *)arg;

    while (1)
    {
        WaitForSingleObject(ctx->ui_mutex, INFINITE);

        if (ctx->to_update)
        {
            clear_console(ctx->hConsole);

            printf("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n");
            printf("┃                   Text Chat                ┃\n");
            printf("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n");

            for (int i = 0; i < ctx->history_count; i++)
            {
                printf("%s\n", ctx->history[i]);
            }

            printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

            printf("Input: %s", ctx->input_buffer);

            ctx->to_update = 0;
        }

        ReleaseMutex(ctx->ui_mutex);
        Sleep(100);
    }

    return 0;
}
