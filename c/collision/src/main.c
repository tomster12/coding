#include "raylib.h"

int main(void)
{
    const int screenWidth = 600;
    const int screenHeight = 450;

    InitWindow(screenWidth, screenHeight, "Different Title");

    SetTargetFPS(60);

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(RAYWHITE);

        DrawText("Hello, Raylib!", 50, 200, 20, LIGHTGRAY);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}
