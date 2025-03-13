// build: -Wall -Werror -O3
// build: -I../libs/raylib/include -L../libs/raylib/lib
// build: -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "raylib.h"

const int screen_width = 1200;
const int screen_height = 1200;
const Vector3 sunsetColour = {255.0f / 255.0f, 161.0f / 255.0f, 79.0f / 255.0f};
const Vector3 middayColour = {1.0f, 1.0f, 0.9f};
const Vector3 direct_light_colour = {0.9f, 0.9f, 0.85f};
const float global_light_strength_min = 0.4f;
const float global_light_strength_max = 0.6f;
const float direct_light_strength_min = 0.4f;
const float direct_light_strength_max = 0.7f;
const float min_sun_centre_dist = 0.3f;
const float min_sun_height = 0.3f;
const float water_level = 0.15f;

Shader heightmap_sh;
RenderTexture2D heightmap_rt;
Shader shadow_sh;
Texture2D voronoi_tex;
float screen_ratio[2];
float pixel_size[2];
Vector3 sunDir;
float global_light_strength;
float direct_light_strength;
Vector3 global_light_colour;
float time_ms = 0.0f;

void draw_heightmap_texture(void);
void draw_plain_heightmap(void);
void draw_shadowed_heightmap(void);
void try_set_shader_value(Shader *shader, const char *name, const void *value, int type);
void update_sun(void);

int main(void)
{
    // SetTraceLogLevel(LOG_WARNING);
    InitWindow(screen_width, screen_height, "Heightmap");
    SetTargetFPS(60);

    screen_ratio[0] = 1.0f;
    screen_ratio[1] = 1.0f;
    if (screen_width > screen_height)
    {
        screen_ratio[0] = (float)screen_width / (float)screen_height;
    }
    else
    {
        screen_ratio[1] = (float)screen_height / (float)screen_width;
    }
    pixel_size[0] = 1.0f / (float)screen_width;
    pixel_size[1] = 1.0f / (float)screen_height;

    heightmap_sh = LoadShader("../shaders/shader.vs", "../shaders/heightmap.fs");
    heightmap_rt = LoadRenderTexture(screen_width, screen_height);
    shadow_sh = LoadShader("../shaders/shader.vs", "../shaders/shadow.fs");
    Image voronoi_img = LoadImage("../voronoi.png");
    voronoi_tex = LoadTextureFromImage(voronoi_img);
    UnloadImage(voronoi_img);

    draw_heightmap_texture();

    while (!WindowShouldClose())
    {
        time_ms = GetTime() * 1000.0f;

        update_sun();

        BeginDrawing();
        ClearBackground(MAGENTA);
        draw_shadowed_heightmap();
        EndDrawing();
    }

    UnloadShader(heightmap_sh);
    UnloadRenderTexture(heightmap_rt);
    UnloadShader(shadow_sh);
    UnloadTexture(voronoi_tex);

    CloseWindow();

    return 0;
}

void try_set_shader_value(Shader *shader, const char *name, const void *value, int type)
{
    int loc = GetShaderLocation(*shader, name);
    if (loc != -1)
    {
        SetShaderValue(*shader, loc, value, type);
    }
    else
    {
        TraceLog(LOG_WARNING, "Could not find uniform '%s'", name);
    }
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
    try_set_shader_value(&shadow_sh, "pixelSize", &pixel_size, SHADER_UNIFORM_VEC2);
    try_set_shader_value(&shadow_sh, "sunDir", &sunDir, SHADER_UNIFORM_VEC3);
    try_set_shader_value(&shadow_sh, "globalLightStrength", &global_light_strength, SHADER_UNIFORM_FLOAT);
    try_set_shader_value(&shadow_sh, "globalLightColour", &global_light_colour, SHADER_UNIFORM_VEC3);
    try_set_shader_value(&shadow_sh, "directLightStrength", &direct_light_strength, SHADER_UNIFORM_FLOAT);
    try_set_shader_value(&shadow_sh, "directLightColour", &direct_light_colour, SHADER_UNIFORM_VEC3);
    try_set_shader_value(&shadow_sh, "timeMs", &time_ms, SHADER_UNIFORM_FLOAT);
    try_set_shader_value(&shadow_sh, "waterLevel", &water_level, SHADER_UNIFORM_FLOAT);

    // This is important but idk how to use it properly
    // SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "heightmapTex"), (int[]){0}, SHADER_UNIFORM_INT);
    // SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "voronoiTex"), (int[]){1}, SHADER_UNIFORM_INT);
    // SetShaderValueTexture(shadow_sh, GetShaderLocation(shadow_sh, "voronoiTex"), voronoi_tex);

    BeginShaderMode(shadow_sh);
    DrawTextureRec(heightmap_rt.texture, (Rectangle){0, 0, screen_width, -screen_height}, (Vector2){0, 0}, WHITE);
    EndShaderMode();
}

void update_sun(void)
{
    // Set sun position to the mouse
    Vector2 mousePos = GetMousePosition();
    Vector3 sunPos = {mousePos.x / screen_width, mousePos.y / screen_height, 1.0f};

    // Calculate suns offset from the centre
    float centreDirX = sunPos.x - 0.5f;
    float centreDirY = sunPos.y - 0.5f;
    float centreDist = sqrtf(centreDirX * centreDirX + centreDirY * centreDirY);

    // Keep the sun a minimum distance from the centre
    if (centreDist < min_sun_centre_dist)
    {
        sunPos.x = 0.5f + min_sun_centre_dist * centreDirX / centreDist;
        sunPos.y = 0.5f + min_sun_centre_dist * centreDirY / centreDist;
    }

    // Make sun lower when further away
    sunPos.z = sqrt(1.0f - 2.0f * centreDist * centreDist);
    if (sunPos.z < min_sun_height)
        sunPos.z = min_sun_height;

    // Point sun dir towards the sun
    sunDir.x = sunPos.x - 0.5f;
    sunDir.y = 0.5f - sunPos.y;
    sunDir.z = sunPos.z;

    // Update the colours based on sun height
    float middayPct = (sunPos.z - min_sun_height) / (1.0f - min_sun_height);
    global_light_strength = global_light_strength_min + (global_light_strength_max - global_light_strength_min) * middayPct;
    direct_light_strength = direct_light_strength_min + (direct_light_strength_max - direct_light_strength_min) * middayPct;
    global_light_colour.x = sunsetColour.x + (middayColour.x - sunsetColour.x) * middayPct;
    global_light_colour.y = sunsetColour.y + (middayColour.y - sunsetColour.y) * middayPct;
    global_light_colour.z = sunsetColour.z + (middayColour.z - sunsetColour.z) * middayPct;
}
