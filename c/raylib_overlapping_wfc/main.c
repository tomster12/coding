// build: -Wall -Werror -I../libs/raylib/include -L../libs/raylib/lib -lraylib -lopengl32 -lgdi32 -lwinmm

#include <stdlib.h>
#include <stdio.h>
#include "raylib.h"

#define SCREEN_WIDTH 1100
#define SCREEN_HEIGHT 800
#define RESULT_WIDTH 300
#define RESULT_HEIGHT 300
#define WFC_MAX_DEPTH 3
#define SAMPLE_PATH "../samples/Sewers.png"
// #define SAMPLE_PATH "C:/Users/tombu/Files/Coding/c/raylib_overlapping_wfc/samples/Sewers.png"

// [ EAST, SOUTH, WEST, NORTH ]
Vector2 NEIGHBOUR_DIRS[4] = {
    {1, 0}, {0, 1}, {-1, 0}, {0, -1}};

size_t get_opposite_dir(size_t dir)
{
    return (dir + 2) % 4;
}

size_t compare_colors(Color color_a, Color color_b)
{
    if (color_a.r != color_b.r || color_a.g != color_b.g || color_a.b != color_b.b || color_a.a != color_b.a)
    {
        return 0;
    }

    return 1;
}

typedef struct Pattern
{
    Color *pixels;
    size_t *allowed_neighbours;
} Pattern;

typedef struct PatternSet
{
    size_t source_width;
    size_t source_height;
    size_t pattern_dim;
    size_t pattern_count;
    Pattern *patterns;
} PatternSet;

typedef struct CellData
{
    size_t *allowed_patterns;
    size_t allowed_patterns_count;
    size_t is_visited;
    size_t is_collapsed;
    int collapsed_pattern;
} CellData;

typedef struct WaveData
{
    PatternSet *pattern_set;
    size_t width;
    size_t height;
    CellData *cells;
    Color *pixels;
    Texture2D texture;
} WaveData;

void pattern_init_from_pixels(Pattern *pattern, PatternSet *pattern_set, Color *pixels, size_t x, size_t y, size_t dim)
{
    // Setup a pattern centred on the source data
    Image pattern_image = GenImageColor(dim, dim, PINK);
    pattern->pixels = LoadImageColors(pattern_image);
    UnloadImage(pattern_image);

    // For each pixel inside the dim square
    for (int pattern_y = 0; pattern_y < dim; ++pattern_y)
    {
        for (int pattern_x = 0; pattern_x < dim; ++pattern_x)
        {
            size_t pixel_x = x - dim / 2 + pattern_x;
            size_t pixel_y = y - dim / 2 + pattern_y;

            // // If the position is outside the source image then default to PINK, otherwise grab the pixel
            // Color pixel = PINK;
            // if (pixel_x >= 0 && pixel_x < pattern_set->source_width && pixel_y >= 0 && pixel_y < pattern_set->source_height)
            // {
            //     pixel = pixels[pixel_x + pixel_y * pattern_set->source_width];
            // }

            // Grab pixel from the source, wrapping coordinates
            size_t pixel_x_wrapped = (pixel_x + pattern_set->source_width) % pattern_set->source_width;
            size_t pixel_y_wrapped = (pixel_y + pattern_set->source_height) % pattern_set->source_height;
            Color pixel = pixels[pixel_x_wrapped + pixel_y_wrapped * pattern_set->source_width];

            pattern->pixels[pattern_x + pattern_y * dim] = pixel;
        }
    }

    // Initialize allowed neighbours to 0
    pattern->allowed_neighbours = malloc(pattern_set->pattern_count * sizeof(size_t));
    for (size_t i = 0; i < pattern_set->pattern_count; ++i)
        pattern->allowed_neighbours[i] = 0;
}

void pattern_destroy(Pattern *pattern)
{
    UnloadImageColors(pattern->pixels);
}

size_t pattern_can_overlap(PatternSet *pattern_set, size_t index_a, size_t index_b, size_t dir)
{
    // For every pixel in pattern A
    for (size_t ay = 0; ay < pattern_set->pattern_dim; ++ay)
    {
        for (size_t ax = 0; ax < pattern_set->pattern_dim; ++ax)
        {
            // If it inside pattern B
            size_t opposite_dir = get_opposite_dir(dir);
            int bx = ax + NEIGHBOUR_DIRS[opposite_dir].x;
            int by = ay + NEIGHBOUR_DIRS[opposite_dir].y;

            if (bx >= 0 && bx < pattern_set->pattern_dim && by >= 0 && by < pattern_set->pattern_dim)
            {
                // If the colors do not match then cannot overlap
                Color color_a = pattern_set->patterns[index_a].pixels[ax + ay * pattern_set->pattern_dim];
                Color color_b = pattern_set->patterns[index_b].pixels[bx + by * pattern_set->pattern_dim];

                if (compare_colors(color_a, color_b) == 0)
                {
                    return 0;
                }
            }
        }
    }

    return 1;
}

void pattern_set_init_from_image(PatternSet *pattern_set, char *input_image_path)
{
    // Read source image colours
    Image source_image = LoadImage(input_image_path);
    ImageFormat(&source_image, PIXELFORMAT_UNCOMPRESSED_R8G8B8A8);
    Color *source_pixels = LoadImageColors(source_image);
    UnloadImage(source_image);

    // Setup pattern data meta info
    pattern_set->source_width = source_image.width;
    pattern_set->source_height = source_image.height;
    pattern_set->pattern_count = source_image.width * source_image.height;
    pattern_set->patterns = malloc((pattern_set->pattern_count) * sizeof(Pattern));
    pattern_set->pattern_dim = 3;

    // Create a pattern from each source image pixel
    for (size_t centre_y = 0; centre_y < pattern_set->source_height; ++centre_y)
    {
        for (size_t centre_x = 0; centre_x < pattern_set->source_width; ++centre_x)
        {
            size_t index = centre_x + centre_y * pattern_set->source_width;
            pattern_init_from_pixels(&pattern_set->patterns[index], pattern_set, source_pixels, centre_x, centre_y, pattern_set->pattern_dim);
        }
    }

    // Populate the allowed neighbours for each pattern
    // Only need to check EAST and SOUTH and populate both patterns
    for (size_t ax = 0; ax < pattern_set->source_height; ++ax)
    {
        for (size_t ay = 0; ay < pattern_set->source_width; ++ay)
        {
            for (size_t dir = 0; dir < 2; ++dir)
            {
                size_t bx = ax + NEIGHBOUR_DIRS[dir].x;
                size_t by = ay + NEIGHBOUR_DIRS[dir].y;

                // Only check if the direction is within the bounds
                if (bx >= 0 && bx < pattern_set->source_width && by >= 0 && by < pattern_set->source_height)
                {
                    size_t index_a = ax + ay * pattern_set->source_width;
                    size_t index_b = bx + by * pattern_set->source_width;

                    if (pattern_can_overlap(pattern_set, index_a, index_b, dir))
                    {
                        pattern_set->patterns[index_a].allowed_neighbours[index_b] = 1;
                        pattern_set->patterns[index_b].allowed_neighbours[index_a] = 1;
                    }
                }
            }
        }
    }
}

void pattern_set_destroy(PatternSet *pattern_set)
{
    for (size_t i = 0; i < pattern_set->pattern_count; ++i)
    {
        pattern_destroy(pattern_set->patterns);
    }

    free(pattern_set->patterns);
}

void cell_data_init(CellData *cell_data, WaveData *wave_data)
{
    cell_data->is_visited = 0;
    cell_data->is_collapsed = 0;
    cell_data->collapsed_pattern = -1;
    cell_data->allowed_patterns = malloc(wave_data->pattern_set->pattern_count * sizeof(size_t));
    cell_data->allowed_patterns_count = wave_data->pattern_set->pattern_count;

    for (size_t i = 0; i < wave_data->pattern_set->pattern_count; ++i)
    {
        cell_data->allowed_patterns[i] = 1;
    }
}

void cell_data_destroy(CellData *cell_data)
{
    free(cell_data->allowed_patterns);
}

void wave_data_init(WaveData *wave_data, PatternSet *pattern_set)
{
    wave_data->pattern_set = pattern_set;
    wave_data->width = RESULT_WIDTH;
    wave_data->height = RESULT_HEIGHT;
    wave_data->cells = malloc((wave_data->width * wave_data->height) * sizeof(CellData));

    Image image = GenImageColor(wave_data->width, wave_data->height, BLUE);
    wave_data->pixels = LoadImageColors(image);
    wave_data->texture = LoadTextureFromImage(image);
    UnloadImage(image);

    for (size_t i_result = 0; i_result < wave_data->width * wave_data->height; ++i_result)
    {
        wave_data->pixels[i_result] = PINK;
        cell_data_init(&wave_data->cells[i_result], wave_data);
    }

    UpdateTexture(wave_data->texture, wave_data->pixels);
}

void wave_data_destroy(WaveData *wave_data)
{
    for (size_t i_result = 0; i_result < wave_data->width * wave_data->height; ++i_result)
    {
        cell_data_destroy(&wave_data->cells[i_result]);
    }

    free(wave_data->cells);

    UnloadImageColors(wave_data->pixels);
    UnloadTexture(wave_data->texture);
}

int wave_data_next_unobserved_cell(WaveData *wave_data)
{
    float min_entropy = INT_MAX;
    int min_index = -1;

    for (size_t i_result = 0; i_result < wave_data->width * wave_data->height; ++i_result)
    {
        if (!wave_data->cells[i_result].is_visited)
        {
            float entropy = wave_data->cells[i_result].allowed_patterns_count;
            if (entropy < min_entropy)
            {
                min_entropy = entropy;
                min_index = i_result;
            }
        }
    }

    return min_index;
}

void wave_data_observe_cell(WaveData *wave_data, int index, int depth)
{
    if (depth > WFC_MAX_DEPTH || wave_data->cells[index].is_visited)
        return;

    wave_data->cells[index].is_visited = 1;
}

void wave_data_update_colours(WaveData *wave_data)
{
    // Calculate colour of each cell in the output
    size_t pos = wave_data->pattern_set->pattern_dim / 2;

    for (size_t i_cell = 0; i_cell < wave_data->width * wave_data->height; ++i_cell)
    {
        // If cell is collapsed then do not update
        if (wave_data->cells[i_cell].is_collapsed)
        {
            Pattern *pattern = &wave_data->pattern_set->patterns[wave_data->cells[i_cell].collapsed_pattern];
            Color pattern_color = pattern->pixels[pos + pos * wave_data->pattern_set->pattern_dim];
            wave_data->pixels[i_cell] = pattern_color;
        }

        // Otherwise average the colour of each possible pattern
        unsigned int average_r = 0;
        unsigned int average_g = 0;
        unsigned int average_b = 0;
        unsigned int average_a = 0;
        size_t count = 0;

        for (size_t i_pattern = 0; i_pattern < wave_data->pattern_set->pattern_count; ++i_pattern)
        {
            if (wave_data->cells[i_cell].allowed_patterns[i_pattern] == 1)
            {
                Pattern *pattern = &wave_data->pattern_set->patterns[i_pattern];
                Color pattern_color = pattern->pixels[pos + pos * wave_data->pattern_set->pattern_dim];
                average_r += pattern_color.r;
                average_g += pattern_color.g;
                average_b += pattern_color.b;
                average_a += pattern_color.a;
                count++;
            }
        }

        if (count > 0)
        {
            average_r /= count;
            average_g /= count;
            average_b /= count;
            average_a /= count;
        }

        Color average_color = {average_a, average_g, average_b, average_a};
        wave_data->pixels[i_cell] = average_color;
    }
}

int wave_data_propogate(WaveData *wave_data)
{
    int cell = wave_data_next_unobserved_cell(wave_data);

    if (cell < 0)
        return -1;

    for (size_t i = 0; i < wave_data->width * wave_data->height; ++i)
        wave_data->cells[i].is_visited = 0;

    wave_data_observe_cell(wave_data, cell, 0);

    wave_data_update_colours(wave_data);

    return 0;
}

void wave_data_draw(WaveData *wave_data)
{
    UpdateTexture(wave_data->texture, wave_data->pixels);

    size_t draw_size = (SCREEN_HEIGHT * 0.75);
    size_t draw_scale = draw_size / wave_data->height;
    Vector2 draw_pos = {
        SCREEN_WIDTH / 2 - draw_size / 2,
        SCREEN_HEIGHT / 2 - draw_size / 2};

    DrawTextureEx(wave_data->texture, draw_pos, 0.0, draw_scale, WHITE);
}

int main()
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Overlapping WFC");

    PatternSet pattern_set;
    pattern_set_init_from_image(&pattern_set, SAMPLE_PATH);

    WaveData wave_data;
    wave_data_init(&wave_data, &pattern_set);

    int is_finished = 0;

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(RAYWHITE);

        if (is_finished == 0)
        {
            int ret = wave_data_propogate(&wave_data);
            is_finished = ret < 0 ? 1 : 0;
        }

        wave_data_draw(&wave_data);

        EndDrawing();
    }

    wave_data_destroy(&wave_data);
    pattern_set_destroy(&pattern_set);
    CloseWindow();

    return 0;
}
