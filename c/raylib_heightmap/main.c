// build: -Wall -Werror -O3
// build: -I../libs/raylib/include -L../libs/raylib/lib
// build: -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "raylib.h"

const int screen_width = 800;
const int screen_height = 800;
float screen_resolution[2] = {screen_height, screen_width};
float world_scale = 5.0f;

Shader heightmap_sh;
RenderTexture2D heightmap_rt;

void draw_heightmap(void);

int main(void)
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(screen_width, screen_height, "Heightmap");
    SetTargetFPS(60);

    heightmap_sh = LoadShader(TextFormat("../shaders/shader.vs", 330), TextFormat("../shaders/heightmap.fs", 330));
    heightmap_rt = LoadRenderTexture(screen_width, screen_height);
    draw_heightmap();

    while (!WindowShouldClose())
    {
        BeginDrawing();
        DrawTexture(heightmap_rt.texture, 0, 0, WHITE);
        EndDrawing();
    }

    UnloadShader(heightmap_sh);
    UnloadRenderTexture(heightmap_rt);

    CloseWindow();
    return 0;
}

void try_set_shader_value(Shader* shader, const char* name, const void* value, int type)
{
    int loc = GetShaderLocation(*shader, name);
    if (loc == -1) TraceLog(LOG_WARNING, "Could not find uniform: %s", name);
    SetShaderValue(*shader, loc, value, type);
}

void draw_heightmap(void)
{
    try_set_shader_value(&heightmap_sh, "screenResolution", &screen_resolution, SHADER_UNIFORM_VEC2);
    try_set_shader_value(&heightmap_sh, "worldScale", &world_scale, SHADER_UNIFORM_FLOAT);

    BeginTextureMode(heightmap_rt);
    BeginShaderMode(heightmap_sh);

    ClearBackground(RAYWHITE);
    DrawRectangle(0, 0, heightmap_rt.texture.width, heightmap_rt.texture.height, WHITE);

    EndShaderMode();
    EndTextureMode();
}
