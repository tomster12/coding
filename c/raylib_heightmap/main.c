// build: -Wall -Werror -O3
// build: -I../libs/raylib/include -L../libs/raylib/lib
// build: -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdio.h>
#include <stdlib.h>
#include "raylib.h"

Shader shader;
int shader_loc_time;
int shader_loc_resolution;
float time;
Vector2 resolution;

float time;

int main(void)
{
    // Setup raylib window
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(800, 800, "Heightmap");
    SetTargetFPS(60);

    // Initialize variables
    time = 0.0f;
    resolution = (Vector2){ (float)GetScreenWidth(), (float)GetScreenHeight() };

    // Load shader
    shader = LoadShader(TextFormat("../shader.vs", 330), TextFormat("../shader.fs", 330));
    shader_loc_time = GetShaderLocation(shader, "time");
    shader_loc_resolution = GetShaderLocation(shader, "resolution");
    SetShaderValue(shader, shader_loc_time, &time, SHADER_UNIFORM_FLOAT);
    SetShaderValue(shader, shader_loc_resolution, &resolution, SHADER_UNIFORM_VEC2);

    while (!WindowShouldClose())
    {
        BeginDrawing();

        // Increment time in shader
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
