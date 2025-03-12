// build: -Wall -Werror -O3
// build: -I../libs/raylib/include -L../libs/raylib/lib
// build: -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "raylib.h"

const int screen_width = 800;
const int screen_height = 800;
float screen_ratio[2] = {1.0f, 1.0f};
float pixel_size[2] = {1.0f, 1.0f};

Shader heightmap_sh;
RenderTexture2D heightmap_rt;
Shader shadow_sh;

void draw_heightmap_texture(void);
void draw_plain_heightmap(void);
void draw_shadowed_heightmap(void);
void try_set_shader_value(Shader* shader, const char* name, const void* value, int type);

int main(void)
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(screen_width, screen_height, "Heightmap");
    SetTargetFPS(60);

    if (screen_width > screen_height) screen_ratio[0] = (float)screen_width / (float)screen_height;
    else screen_ratio[1] = (float)screen_height / (float)screen_width;
    pixel_size[0] = 1.0f / (float)screen_width;
    pixel_size[1] = 1.0f / (float)screen_height;

    heightmap_sh = LoadShader("../shaders/shader.vs", "../shaders/heightmap.fs");
    heightmap_rt = LoadRenderTexture(screen_width, screen_height);
    shadow_sh = LoadShader("../shaders/shader.vs", "../shaders/shadow.fs");
    
    draw_heightmap_texture();

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(MAGENTA);
        draw_shadowed_heightmap();
        EndDrawing();
    }

    UnloadShader(heightmap_sh);
    UnloadRenderTexture(heightmap_rt);
    UnloadShader(shadow_sh);
    CloseWindow();

    return 0;
}

void try_set_shader_value(Shader* shader, const char* name, const void* value, int type)
{
    int loc = GetShaderLocation(*shader, name);
    if (loc != -1) SetShaderValue(*shader, loc, value, type);
    // else TraceLog(LOG_WARNING, "Could not find uniform '%s'", name);
}

void draw_heightmap_texture(void)
{
    try_set_shader_value(&heightmap_sh, "screenRatio", &screen_ratio, SHADER_UNIFORM_VEC2);
    BeginTextureMode(heightmap_rt);
    BeginShaderMode(heightmap_sh);
    DrawRectangle(0, 0, heightmap_rt.texture.width, heightmap_rt.texture.height, WHITE);
    EndShaderMode();
    EndTextureMode();
}

void draw_plain_heightmap(void)
{
    DrawTextureRec(heightmap_rt.texture, (Rectangle){0, 0, heightmap_rt.texture.width, -heightmap_rt.texture.height}, (Vector2){0, 0}, WHITE);
}

void draw_shadowed_heightmap(void)
{
    try_set_shader_value(&shadow_sh, "screenRatio", &screen_ratio, SHADER_UNIFORM_VEC2);
    try_set_shader_value(&shadow_sh, "pixelSize", &pixel_size, SHADER_UNIFORM_VEC2);
    try_set_shader_value(&shadow_sh, "heightmap", &heightmap_rt.texture, SHADER_UNIFORM_SAMPLER2D);
    BeginShaderMode(shadow_sh);
    DrawTextureRec(heightmap_rt.texture, (Rectangle){0, 0, screen_width, -screen_height}, (Vector2){0, 0}, WHITE);
    EndShaderMode();
}
