// build: -I../libs/raylib/include -L../libs/raylib/lib -lraylib -lopengl32 -lgdi32 -lwinmm

#include "raylib.h"
#include "raymath.h"

#define GRID_SIZE 400

int main()
{
    InitWindow(1800, 1200, "Pixel Array");

    // Setup image, texture, and pixels
    Image grid_img = GenImageColor(GRID_SIZE, GRID_SIZE, RED);
    ImageFormat(&grid_img, PIXELFORMAT_UNCOMPRESSED_R8G8B8A8);
    Texture grid_tex = LoadTextureFromImage(grid_img);
    UnloadImage(grid_img);
    char grid_pixels[GRID_SIZE * GRID_SIZE * 4];

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(RAYWHITE);

        // Update the pixel array
        for (int y = 0; y < GRID_SIZE; y++)
        {
            for (int x = 0; x < GRID_SIZE; x++)
            {
                grid_pixels[(y * GRID_SIZE + x) * 4 + 0] = (char)GetRandomValue(0, 255);
                grid_pixels[(y * GRID_SIZE + x) * 4 + 1] = (char)GetRandomValue(0, 255);
                grid_pixels[(y * GRID_SIZE + x) * 4 + 2] = (char)GetRandomValue(0, 255);
                grid_pixels[(y * GRID_SIZE + x) * 4 + 3] = (char)255;
            }
        }

        // Update then draw the texture in the middle of the screen
        UpdateTexture(grid_tex, grid_pixels);
        DrawTexture(grid_tex, GetScreenWidth() / 2 - grid_tex.width / 2, GetScreenHeight() / 2 - grid_tex.height / 2, WHITE);

        EndDrawing();
    }

    CloseWindow();

    return 0;
}