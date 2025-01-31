// build: -Wall -Werror -I../libs/raylib/include -L../libs/raylib/lib -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdlib.h>
#include <stdio.h>
#include "raylib.h"

#define SCREEN_WIDTH 1100
#define SCREEN_HEIGHT 800
#define OUTPUT_DIM 128

typedef struct PatternSet
{
    Color **pattern_colors;
    Texture2D *pattern_textures;
    size_t pattern_count;
    size_t pattern_dim;
    size_t grid_dim;
} PatternSet;

typedef struct WaveOutput
{
    int *data;
    size_t width;
    size_t height;
} WaveOutput;

void pattern_set_init_from_image(PatternSet *pattern_set, char *image_path)
{
    Image input_image = LoadImage(image_path);
    ImageFormat(&input_image, PIXELFORMAT_UNCOMPRESSED_R8G8B8A8);

    pattern_set->grid_dim = input_image.width;
    pattern_set->pattern_dim = 3;
    pattern_set->pattern_count = pattern_set->grid_dim * pattern_set->grid_dim;
    pattern_set->pattern_colors = malloc((pattern_set->pattern_count) * sizeof(Color *));
    pattern_set->pattern_textures = malloc((pattern_set->pattern_count) * sizeof(Texture2D));

    Color *pixels = LoadImageColors(input_image);

    for (size_t y = 0; y < pattern_set->grid_dim; ++y)
    {
        for (size_t x = 0; x < pattern_set->grid_dim; ++x)
        {
            Image image = GenImageColor(pattern_set->pattern_dim, pattern_set->pattern_dim, BLUE);
            Color *colors = LoadImageColors(image);

            // Create the pattern here

            int index = x + y * pattern_set->grid_dim;
            pattern_set->pattern_colors[index] = colors;
            pattern_set->pattern_textures[index] = LoadTextureFromImage(image);

            UnloadImage(image);
        }
    }

    UnloadImageColors(pixels);
    UnloadImage(input_image);
}

void pattern_set_destroy(PatternSet *pattern_set)
{
    for (size_t i = 0; i < pattern_set->pattern_count; ++i)
    {
        UnloadImageColors(pattern_set->pattern_colors[i]);
        UnloadTexture(pattern_set->pattern_textures[i]);
    }

    free(pattern_set->pattern_colors);
    free(pattern_set->pattern_textures);
}

void pattern_set_draw(PatternSet *pattern_set)
{
    size_t gap = 10;
    size_t size = 50;

    int start_x = SCREEN_WIDTH / 2 - (pattern_set->grid_dim * (gap + size) + size) / 2;
    int start_y = SCREEN_HEIGHT / 2 - (pattern_set->grid_dim * (gap + size) + size) / 2;
    size_t draw_size = size / pattern_set->pattern_dim;

    for (size_t x = 0; x < pattern_set->grid_dim; ++x)
    {
        for (size_t y = 0; y < pattern_set->grid_dim; ++y)
        {
            size_t index = x + y * pattern_set->grid_dim;
            Vector2 draw_pos = {start_x + x * (size + gap), start_y + y * (size + gap)};
            DrawTextureEx(pattern_set->pattern_textures[index], draw_pos, 0.0, draw_size, WHITE);
        }
    }
}

void wave_init(WaveOutput *wave, size_t dim)
{
}

void wave_destroy(WaveOutput *wave)
{
}

void wave_propogate(WaveOutput *wave)
{
}

int main()
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Overlapping WFC");

    PatternSet pattern_set;
    pattern_set_init_from_image(&pattern_set, "../samples/City.png");

    WaveOutput wave;
    wave_init(&wave, OUTPUT_DIM);

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(RAYWHITE);

        pattern_set_draw(&pattern_set);

        wave_propogate(&wave);

        EndDrawing();
    }

    wave_destroy(&wave);
    pattern_set_destroy(&pattern_set);
    CloseWindow();

    return 0;
}
