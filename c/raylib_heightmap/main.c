// build: -Wall -Werror -O3
// build: -I../libs/raylib/include -L../libs/raylib/lib
// build: -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "raylib.h"

const int screen_width = 1200;
const int screen_height = 1200;
const Vector3 sunsetColour = {0.9f, 0.5f, 0.5f};
const Vector3 middayColour = {1.0f, 1.0f, 0.9f};
const float globalLightStrengthMin = 0.2f;
const float globalLightStrengthMax = 0.6f;
const float directLightStrengthMin = 0.0f;
const float directLightStrengthMax = 0.0f;

Shader heightmap_sh;
RenderTexture2D heightmap_rt;
Shader shadow_sh;
float screen_ratio[2];
float pixel_size[2];
Vector3 sunDir = {0.5f, 0.8f, 0.3f};
float globalLightStrength;
Vector3 globalLightColour;
float directLightStrength = 0.8f;
Vector3 directLightColour = {0.9f, 0.9f, 0.85f};
float timeMilliseconds = 0.0f;
float waterLevel = 0.15f;

void draw_heightmap_texture(void);
void draw_plain_heightmap(void);
void draw_shadowed_heightmap(void);
void try_set_shader_value(Shader *shader, const char *name, const void *value, int type);
void update_sun(void);

int main(void)
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(screen_width, screen_height, "Heightmap");
    SetTargetFPS(60);

    screen_ratio[0] = 1.0f;
    screen_ratio[1] = 1.0f;
    if (screen_width > screen_height)
        screen_ratio[0] = (float)screen_width / (float)screen_height;
    else
        screen_ratio[1] = (float)screen_height / (float)screen_width;
    pixel_size[0] = 1.0f / (float)screen_width;
    pixel_size[1] = 1.0f / (float)screen_height;

    heightmap_sh = LoadShader("../shaders/shader.vs", "../shaders/heightmap.fs");
    heightmap_rt = LoadRenderTexture(screen_width, screen_height);
    shadow_sh = LoadShader("../shaders/shader.vs", "../shaders/shadow.fs");

    draw_heightmap_texture();

    while (!WindowShouldClose())
    {
        timeMilliseconds = GetTime() * 1000.0f;

        update_sun();

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

void try_set_shader_value(Shader *shader, const char *name, const void *value, int type)
{
    int loc = GetShaderLocation(*shader, name);
    if (loc != -1)
        SetShaderValue(*shader, loc, value, type);
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
    try_set_shader_value(&shadow_sh, "pixelSize", &pixel_size, SHADER_UNIFORM_VEC2);
    try_set_shader_value(&shadow_sh, "heightmap", &heightmap_rt.texture, SHADER_UNIFORM_SAMPLER2D);
    try_set_shader_value(&shadow_sh, "sunDir", &sunDir, SHADER_UNIFORM_VEC3);
    try_set_shader_value(&shadow_sh, "globalLightStrength", &globalLightStrength, SHADER_UNIFORM_FLOAT);
    try_set_shader_value(&shadow_sh, "globalLightColour", &globalLightColour, SHADER_UNIFORM_VEC3);
    try_set_shader_value(&shadow_sh, "directLightStrength", &directLightStrength, SHADER_UNIFORM_FLOAT);
    try_set_shader_value(&shadow_sh, "directLightColour", &directLightColour, SHADER_UNIFORM_VEC3);
    try_set_shader_value(&shadow_sh, "timeMilliseconds", &timeMilliseconds, SHADER_UNIFORM_FLOAT);
    try_set_shader_value(&shadow_sh, "waterLevel", &waterLevel, SHADER_UNIFORM_FLOAT);

    BeginShaderMode(shadow_sh);
    DrawTextureRec(heightmap_rt.texture, (Rectangle){0, 0, screen_width, -screen_height}, (Vector2){0, 0}, WHITE);
    EndShaderMode();
}

void update_sun(void)
{
    Vector2 mousePos = GetMousePosition();
    Vector3 sunPos = {mousePos.x / screen_width, mousePos.y / screen_height, 1.0f};

    // Calculate suns offset from the centre
    float centreDX = sunPos.x - 0.5f;
    float centreDY = sunPos.y - 0.5f;
    float centreDistSq = centreDX * centreDX + centreDY * centreDY;
    float centreDist = sqrtf(centreDistSq);

    // Make sun lower when further away
    sunPos.z = sqrt(1.0f - 2.0f * centreDist * centreDist);
    if (sunPos.z < waterLevel + 0.2f)
        sunPos.z = waterLevel + 0.2f;

    // Point sun dir towards the sun
    sunDir.x = sunPos.x - 0.5f;
    sunDir.y = 0.5f - sunPos.y;
    sunDir.z = sunPos.z;

    // Update the colours based on sun height
    globalLightStrength = globalLightStrengthMin + (globalLightStrengthMax - globalLightStrengthMin) * (1.0f - 2.0f * centreDistSq);
    globalLightColour.x = sunsetColour.x + (middayColour.x - sunsetColour.x) * globalLightStrength;
    globalLightColour.y = sunsetColour.y + (middayColour.y - sunsetColour.y) * globalLightStrength;
    globalLightColour.z = sunsetColour.z + (middayColour.z - sunsetColour.z) * globalLightStrength;

    directLightStrength = directLightStrengthMin + (directLightStrengthMax - directLightStrengthMin) * (1.0f - 2.0f * centreDistSq); 
}
