// build: -Wall -Werror -I../libs/raylib/include -L../libs/raylib/lib -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdlib.h>
#include <stdio.h>
#include "raylib.h"

#define SCREEN_WIDTH 1100
#define SCREEN_HEIGHT 800
#define OUTPUT_DIM 128

typedef struct WFCPatternSet
{
    Color **pattern_colors;
    Texture2D *pattern_textures;
    size_t pattern_count;
    size_t pattern_dim;
    size_t source_width;
    size_t source_height;
} WFCPatternSet;

typedef struct WFCWave
{
    int *data;
    size_t width;
    size_t height;
} WFCWave;

void pattern_set_init_from_image(WFCPatternSet *pattern_set, char *input_image_path)
{
    Image source_image = LoadImage(input_image_path);
    ImageFormat(&source_image, PIXELFORMAT_UNCOMPRESSED_R8G8B8A8);
    Color *source_pixels = LoadImageColors(source_image);
    UnloadImage(source_image);

    pattern_set->source_width = source_image.width;
    pattern_set->source_height = source_image.height;
    pattern_set->pattern_dim = 3;
    pattern_set->pattern_count = pattern_set->source_width * pattern_set->source_height;
    pattern_set->pattern_colors = malloc((pattern_set->pattern_count) * sizeof(Color *));
    pattern_set->pattern_textures = malloc((pattern_set->pattern_count) * sizeof(Texture2D));

    for (size_t centre_y = 0; centre_y < pattern_set->source_width; ++centre_y)
    {
        for (size_t centre_x = 0; centre_x < pattern_set->source_height; ++centre_x)
        {
            Image pattern_image = GenImageColor(pattern_set->pattern_dim, pattern_set->pattern_dim, PINK);
            Color *pattern_colors = LoadImageColors(pattern_image);
            Texture2D pattern_texture = LoadTextureFromImage(pattern_image);
            UnloadImage(pattern_image);

            for (int pattern_x = 0; pattern_x < pattern_set->pattern_dim; ++pattern_x)
            {
                for (int pattern_y = 0; pattern_y < pattern_set->pattern_dim; ++pattern_y)
                {
                    size_t pixel_x = centre_x - pattern_set->pattern_dim / 2 + pattern_y;
                    size_t pixel_y = centre_y - pattern_set->pattern_dim / 2 + pattern_x;
                    Color pixel_color = WHITE;

                    if (pixel_x >= 0 && pixel_x < pattern_set->source_width && pixel_y >= 0 && pixel_y < pattern_set->source_height)
                    {
                        pixel_color = source_pixels[pixel_x + pixel_y * pattern_set->source_width];
                    }

                    pattern_colors[pattern_y + pattern_x * pattern_set->pattern_dim] = pixel_color;
                }
            }

            UpdateTexture(pattern_texture, pattern_colors);

            int index = centre_x + centre_y * pattern_set->source_width;
            pattern_set->pattern_colors[index] = pattern_colors;
            pattern_set->pattern_textures[index] = pattern_texture;
        }
    }

    UnloadImageColors(source_pixels);
}

void pattern_set_destroy(WFCPatternSet *pattern_set)
{
    for (size_t i = 0; i < pattern_set->pattern_count; ++i)
    {
        UnloadImageColors(pattern_set->pattern_colors[i]);
        UnloadTexture(pattern_set->pattern_textures[i]);
    }

    free(pattern_set->pattern_colors);
    free(pattern_set->pattern_textures);
}

void pattern_set_draw(WFCPatternSet *pattern_set)
{
    size_t gap = 10;
    size_t size = 50;

    int start_x = SCREEN_WIDTH / 2 - (pattern_set->source_width * (gap + size) + size) / 2;
    int start_y = SCREEN_HEIGHT / 2 - (pattern_set->source_height * (gap + size) + size) / 2;
    size_t draw_size = size / pattern_set->pattern_dim;

    for (size_t x = 0; x < pattern_set->source_width; ++x)
    {
        for (size_t y = 0; y < pattern_set->source_height; ++y)
        {
            size_t index = x + y * pattern_set->source_width;
            Vector2 draw_pos = {start_x + x * (size + gap), start_y + y * (size + gap)};
            DrawTextureEx(pattern_set->pattern_textures[index], draw_pos, 0.0, draw_size, WHITE);
        }
    }
}

void wave_init(WFCWave *wave, size_t dim)
{
}

void wave_destroy(WFCWave *wave)
{
}

void wave_propogate(WFCWave *wave)
{
}

int main()
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Overlapping WFC");

    WFCPatternSet pattern_set;
    pattern_set_init_from_image(&pattern_set, "../samples/City.png");

    WFCWave wave;
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
