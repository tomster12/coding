// build: -I../libs/raylib/include -L../libs/raylib/lib -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdlib.h>
#include <stdio.h>
#include "raylib.h"
#include "raymath.h"

#define MAX_INSTANCES 30000
#define BOX_SIZE 0.1f
#define RandomFloat01(min, max) (min + (max - min) * ((float)rand() / RAND_MAX))

int main()
{
    InitWindow(1800, 1200, "Mesh GPU Instancing");

    // Setup 3D camera
    Camera camera = {0};
    camera.position = (Vector3){0.0f, 0.0f, 40.0f};
    camera.target = (Vector3){0.0f, 0.0f, 0.0f};
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 45.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    // Setup instances mesh and positions
    Mesh mesh = GenMeshCube(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    Matrix transforms[MAX_INSTANCES];
    for (int i = 0; i < MAX_INSTANCES; i++)
    {
        Vector3 randomPos = (Vector3){
            RandomFloat01(-10.0f, 10.0f),
            RandomFloat01(-10.0f, 10.0f),
            RandomFloat01(-10.0f, 10.0f)};
        transforms[i] = MatrixTranslate(randomPos.x, randomPos.y, randomPos.z);
    }

    // Setup instance shader
    const char *dir = GetApplicationDirectory();
    Shader shader = LoadShader(TextFormat("%s/../main.vs", dir), TextFormat("%s/../main.fs", dir));
    shader.locs[SHADER_LOC_MATRIX_MVP] = GetShaderLocation(shader, "projectionMatrix");
    shader.locs[SHADER_LOC_MATRIX_MODEL] = GetShaderLocationAttrib(shader, "instanceMatrix");
    Material matInstances = LoadMaterialDefault();
    matInstances.shader = shader;
    matInstances.maps[MATERIAL_MAP_DIFFUSE].color = RED;

    SetTargetFPS(60);

    while (!WindowShouldClose())
    {
        for (int i = 0; i < MAX_INSTANCES; i++)
        {
            Vector3 randomOffset = (Vector3){
                RandomFloat01(-0.04f, 0.04f),
                RandomFloat01(-0.04f, 0.04f),
                RandomFloat01(-0.04f, 0.04f)};
            transforms[i] = MatrixMultiply(MatrixTranslate(randomOffset.x, randomOffset.y, randomOffset.z), transforms[i]);
        }

        UpdateCamera(&camera, CAMERA_ORBITAL);

        BeginDrawing();
        {
            ClearBackground(RAYWHITE);

            BeginMode3D(camera);
            {
                DrawMeshInstanced(mesh, matInstances, transforms, MAX_INSTANCES);
            }
            EndMode3D();

            DrawText(TextFormat("FPS: %i", GetFPS()), 10, 10, 20, RED);
        }
        EndDrawing();
    }

    UnloadMesh(mesh);
    CloseWindow();
}
