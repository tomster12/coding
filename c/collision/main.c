#include "raylib.h"

int main(void)
{
    const int screenWidth = 500;
    const int screenHeight = 500;

    InitWindow(screenWidth, screenHeight, "Title");

    SetTargetFPS(60);

    Vector2 points[] = {
        {100, 100},
        {200, 100},
        {200, 200},
        {100, 200}};

    int triangles[] = {
        0,
        2,
        1,
        0,
        3,
        2};

    int triangleCount = sizeof(triangles) / sizeof(triangles[0]);

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(RAYWHITE);

        for (int i = 0; i < triangleCount; i += 3)
        {
            DrawTriangle(points[triangles[i]], points[triangles[i + 1]], points[triangles[i + 2]], DARKGRAY);
        }

        EndDrawing();
    }

    CloseWindow();
    return 0;
}
