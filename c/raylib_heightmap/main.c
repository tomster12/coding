// cbuild: -Wall -Werror -O3
// cbuild: -I../libs/raylib/include -L../libs/raylib/lib
// cbuild: -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "raylib.h"

const int screen_width = 1200;
const int screen_height = 1200;

const float screen_ratio[2] = {
    screen_width < screen_height ? 1.0f : ((float)screen_width / (float)screen_height),
    screen_width > screen_height ? 1.0f : ((float)screen_height / (float)screen_width)
};
const float pixel_size[2] = {
    1.0f / (float)screen_width,
    1.0f / (float)screen_height
};

const Vector3 sunset_colour = {255.0f / 255.0f, 161.0f / 255.0f, 79.0f / 255.0f};
const Vector3 midday_colour = {1.0f, 1.0f, 0.9f};
const Vector3 direct_light_colour = {0.9f, 0.9f, 0.85f};
const float global_light_strength_min = 0.3f;
const float global_light_strength_max = 0.5f;
const float direct_light_strength_min = 0.4f;
const float direct_light_strength_max = 0.7f;
const float min_sun_centre_dist = 0.4f;
const float min_sun_height = 0.45f;
const float water_level = 0.15f;

Shader heightmap_sh;
RenderTexture2D heightmap_rt;
Shader shadow_sh;
Texture2D voronoi_tex;
float time_ms = 0.0f;
Vector3 sun_dir;
float global_light_strength;
float direct_light_strength;
Vector3 global_light_colour;

void draw_heightmap_texture(void);
void draw_plain_heightmap(void);
void draw_shadowed_heightmap(void);
void update_sun(void);

int main(void)
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(screen_width, screen_height, "Heightmap");
    SetTargetFPS(60);

    // Initialize the shaders and textures
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

void update_sun(void)
{
    // Set sun position to the mouse
    Vector2 mousePos = GetMousePosition();
    Vector3 sunPos = {mousePos.x / screen_width, mousePos.y / screen_height, 1.0f};

    // Calculate suns offset from the centre
    Vector2 centreDir = {sunPos.x - 0.5f, sunPos.y - 0.5f};
    float centreDist = sqrtf(centreDir.x * centreDir.x + centreDir.y * centreDir.y) * 2.0f;
    if (centreDist > 1.0f) {
        centreDist = 1.0f;
    }

    // Keep the sun a minimum distance from the centre
    if (centreDist < min_sun_centre_dist)
    {
        sunPos.x = 0.5f + min_sun_centre_dist * centreDir.x / centreDist;
        sunPos.y = 0.5f + min_sun_centre_dist * centreDir.y / centreDist;
    }

    // Make sun lower when further away
    sunPos.z = sqrt(1.0f - centreDist * centreDist);
    if (sunPos.z < min_sun_height) {
        sunPos.z = min_sun_height;
    }

    // Point sun dir towards the sun
    sun_dir.x = sunPos.x - 0.5f;
    sun_dir.y = 0.5f - sunPos.y;
    sun_dir.z = sunPos.z;

    // Update the colours based on sun height
    float middayPct = (sunPos.z - min_sun_height) / (1.0f - min_sun_height);
    global_light_strength = global_light_strength_min + (global_light_strength_max - global_light_strength_min) * middayPct;
    direct_light_strength = direct_light_strength_min + (direct_light_strength_max - direct_light_strength_min) * middayPct;
    global_light_colour.x = sunset_colour.x + (midday_colour.x - sunset_colour.x) * middayPct;
    global_light_colour.y = sunset_colour.y + (midday_colour.y - sunset_colour.y) * middayPct;
    global_light_colour.z = sunset_colour.z + (midday_colour.z - sunset_colour.z) * middayPct;
}

void draw_heightmap_texture(void)
{
    BeginTextureMode(heightmap_rt);
    BeginShaderMode(heightmap_sh);
    SetShaderValue(heightmap_sh, GetShaderLocation(heightmap_sh, "screenRatio"), &screen_ratio, SHADER_UNIFORM_VEC2);
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
    BeginShaderMode(shadow_sh);
    SetShaderValueTexture(shadow_sh, GetShaderLocation(shadow_sh, "heightmapTex"), heightmap_rt.texture);
    SetShaderValueTexture(shadow_sh, GetShaderLocation(shadow_sh, "voronoiTex"), voronoi_tex);
    SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "pixelSize"), &pixel_size, SHADER_UNIFORM_VEC2);
    SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "sunDir"), &sun_dir, SHADER_UNIFORM_VEC3);
    SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "globalLightStrength"), &global_light_strength, SHADER_UNIFORM_FLOAT);
    SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "globalLightColour"), &global_light_colour, SHADER_UNIFORM_VEC3);
    SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "directLightStrength"), &direct_light_strength, SHADER_UNIFORM_FLOAT);
    SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "directLightColour"), &direct_light_colour, SHADER_UNIFORM_VEC3);
    SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "timeMs"), &time_ms, SHADER_UNIFORM_FLOAT);
    SetShaderValue(shadow_sh, GetShaderLocation(shadow_sh, "waterLevel"), &water_level, SHADER_UNIFORM_FLOAT);
    DrawTextureRec(heightmap_rt.texture, (Rectangle){0, 0, screen_width, -screen_height}, (Vector2){0, 0}, WHITE);
    EndShaderMode();
}
