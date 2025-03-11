// build: -Wall -Werror -O3
// build: -I../libs/raylib/include -L../libs/raylib/lib
// build: -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdio.h>
#include <stdlib.h>
#include "raylib.h"

int main(void)
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(800, 800, "Heightmap");
    SetTargetFPS(60);

    // Main variables
    float time = 0.0f;

    // Load and setup shader
    Shader shader = LoadShader(0, TextFormat("../shader.fs", 330));
    int shader_loc_time = GetShaderLocation(shader, "time");

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(RAYWHITE);

        // Set shader uniform values
        time += GetFrameTime();
        SetShaderValue(shader, shader_loc_time, &time, SHADER_UNIFORM_FLOAT);

        // Draw rect with shader
        BeginDrawing();
        ClearBackground(BLACK);
        BeginShaderMode(shader);
        DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), WHITE);
        EndShaderMode();

        EndDrawing();
    }

    UnloadShader(shader);
    CloseWindow();
    return 0;
}
