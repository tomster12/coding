// build: -Wall -Werror -I../libs/raylib/include -L../libs/raylib/lib -lraylib -lopengl32 -lgdi32 -lwinmm -lm -g

#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <math.h>
#include "raylib.h"

#define SCREEN_WIDTH 1100
#define SCREEN_HEIGHT 800
#define RESULT_WIDTH 16
#define RESULT_HEIGHT 16
#define MAX_DEPTH 5
#define LIMIT_FPS false
#define PATTERN_WRAP true
#define PATTERN_PADDING_COLOR WHITE
#define CONFLICT_COLOR BLUE
#define SAMPLE_PATH "D:/Files/Coding/c/raylib_overlapping_wfc/samples/City.png"

// [ EAST, SOUTH, WEST, NORTH ]
Vector2 NEIGHBOUR_DIRS[4] = {
    {1, 0}, {0, 1}, {-1, 0}, {0, -1}};

#define Direction unsigned char

typedef struct Pattern
{
    Color *pixels;
    size_t frequency;
    unsigned char *overlap_lookup;
    Texture2D texture;
} Pattern;

typedef struct PatternSet
{
    Pattern *patterns;
    size_t pattern_count;
    size_t pattern_dim;
} PatternSet;

typedef struct Cell
{
    size_t *allowed_pattern_list;
    size_t allowed_pattern_count;
    bool is_visited;
    bool is_collapsed;
    float entropy;
} Cell;

typedef struct WaveState
{
    PatternSet *pattern_set;
    size_t width;
    size_t height;
    Cell *cells;
    Color *pixels;
    Texture2D texture;
} WaveState;

// ------------------------

Direction get_opposite_direction(Direction dir)
{
    return (dir + 2) % 4;
}

bool compare_colors(Color color_a, Color color_b)
{
    return color_a.r == color_b.r && color_a.g == color_b.g && color_a.b == color_b.b && color_a.a == color_b.a;
}

// ------------------------

Color *pattern_pixels_from_source(Color *pixels, size_t width, size_t height, size_t x, size_t y, size_t dim)
{
    // Setup a pattern centred on a pixel from the source
    Image pattern_image = GenImageColor(dim, dim, PINK);
    Color *pattern = LoadImageColors(pattern_image);
    UnloadImage(pattern_image);

    // For each pixel inside the dim sized square
    for (int pattern_y = 0; pattern_y < dim; ++pattern_y)
    {
        for (int pattern_x = 0; pattern_x < dim; ++pattern_x)
        {
            size_t pixel_x = x - dim / 2 + pattern_x;
            size_t pixel_y = y - dim / 2 + pattern_y;

            if (PATTERN_WRAP)
            {
                // Grab pixel from the source, wrapping coordinates
                size_t wrapped_pixel_x = (pixel_x + width) % width;
                size_t wrapped_pixel_y = (pixel_y + height) % height;
                pattern[pattern_x + pattern_y * dim] = pixels[wrapped_pixel_x + wrapped_pixel_y * width];
            }
            else
            {
                // Grab pixel from the source, clamping coordinates
                if (pixel_x >= 0 && pixel_x < width && pixel_y >= 0 && pixel_y < height)
                {
                    pattern[pattern_x + pattern_y * dim] = pixels[pixel_x + pixel_y * width];
                }

                // Otherwise, set to a default padding colour
                else
                {
                    pattern[pattern_x + pattern_y * dim] = PATTERN_PADDING_COLOR;
                }
            }
        }
    }

    return pattern;
}

unsigned long pattern_pixels_hash(Color *pixels, size_t dim)
{
    // Hash the pattern pixels, considering the order of the pixels
    unsigned long hash = 0;

    for (size_t i = 0; i < dim * dim; ++i)
    {
        hash = hash * 31 + pixels[i].r;
        hash = hash * 31 + pixels[i].g;
        hash = hash * 31 + pixels[i].b;
        hash = hash * 31 + pixels[i].a;
    }

    return hash;
}

// ------------------------

void pattern_init(Pattern *pattern, PatternSet *pattern_set, Color *pixels, size_t frequency)
{
    pattern->pixels = pixels;
    pattern->frequency = frequency;

    pattern->overlap_lookup = malloc(pattern_set->pattern_count * sizeof(unsigned char));
    for (size_t i = 0; i < pattern_set->pattern_count; ++i)
    {
        pattern->overlap_lookup[i] = 0;
    }

    // Image pattern_image = GenImageColor(pattern_set->pattern_dim, pattern_set->pattern_dim, PINK);
    // pattern->texture = LoadTextureFromImage(pattern_image);
    // UnloadImage(pattern_image);
    // UpdateTexture(pattern->texture, pattern->pixels);
}

void pattern_destroy(Pattern *pattern)
{
    UnloadImageColors(pattern->pixels);
    free(pattern->overlap_lookup);
    // UnloadTexture(pattern->texture);
}

void pattern_overlap_add(Pattern *pattern, size_t index, Direction direction)
{
    pattern->overlap_lookup[index] |= (1 << direction);
}

bool pattern_overlap_check(Pattern *pattern, size_t index, Direction direction)
{
    return (pattern->overlap_lookup[index] & (1 << direction)) > 0;
}

bool pattern_can_overlap(PatternSet *pattern_set, size_t index_a, size_t index_b, Direction direction)
{
    // For every pixel in pattern A
    for (size_t ay = 0; ay < pattern_set->pattern_dim; ++ay)
    {
        for (size_t ax = 0; ax < pattern_set->pattern_dim; ++ax)
        {
            // If it also inside pattern B
            Direction opposite_dir = get_opposite_direction(direction);
            int bx = (int)ax + NEIGHBOUR_DIRS[opposite_dir].x;
            int by = (int)ay + NEIGHBOUR_DIRS[opposite_dir].y;

            if (bx < 0 || bx >= pattern_set->pattern_dim || by < 0 || by >= pattern_set->pattern_dim)
            {
                continue;
            }

            // Check if they are different and if so return
            Color color_a = pattern_set->patterns[index_a].pixels[ax + ay * pattern_set->pattern_dim];
            Color color_b = pattern_set->patterns[index_b].pixels[bx + by * pattern_set->pattern_dim];

            if (!compare_colors(color_a, color_b))
            {
                return false;
            }
        }
    }

    return true;
}

// ------------------------

void pattern_set_init_from_image(PatternSet *pattern_set, const char *input_image_path)
{
    // Read source image colours
    Image source_image = LoadImage(input_image_path);

    if (source_image.width < 1 || source_image.height < 1)
    {
        printf("Failed to load image from path: %s\n", input_image_path);
        exit(1);
    }

    ImageFormat(&source_image, PIXELFORMAT_UNCOMPRESSED_R8G8B8A8);
    Color *source_pixels = LoadImageColors(source_image);
    UnloadImage(source_image);

    // Setup to track each of the unique patterns
    pattern_set->pattern_count = 0;
    pattern_set->pattern_dim = 3;

    size_t max_pattern_count = source_image.width * source_image.height;
    unsigned long *pattern_hashes = malloc(max_pattern_count * sizeof(unsigned long));
    Color **pattern_pixels = malloc(max_pattern_count * sizeof(Color *));
    size_t *pattern_frequencies = malloc(max_pattern_count * sizeof(size_t));

    // Create a pattern from each source image pixel
    for (size_t centre_y = 0; centre_y < source_image.width; ++centre_y)
    {
        for (size_t centre_x = 0; centre_x < source_image.height; ++centre_x)
        {
            Color *pixels = pattern_pixels_from_source(source_pixels, source_image.width, source_image.height, centre_x, centre_y, pattern_set->pattern_dim);
            unsigned long hash = pattern_pixels_hash(pixels, pattern_set->pattern_dim);

            // Update the frequency of any existing matching pattern
            int found_index = -1;
            for (size_t i = 0; i < pattern_set->pattern_count; ++i)
            {
                if (pattern_hashes[i] == hash)
                {
                    found_index = i;
                    break;
                }
            }
            if (found_index == -1)
            {
                pattern_hashes[pattern_set->pattern_count] = hash;
                pattern_pixels[pattern_set->pattern_count] = pixels;
                pattern_frequencies[pattern_set->pattern_count] = 1;
                pattern_set->pattern_count++;
            }
            else
            {
                pattern_frequencies[found_index]++;
                UnloadImageColors(pixels);
            }
        }
    }

    // Load final patterns into the pattern set and delete temporary data
    pattern_set->patterns = malloc(pattern_set->pattern_count * sizeof(Pattern));

    for (size_t i = 0; i < pattern_set->pattern_count; ++i)
    {
        pattern_init(&pattern_set->patterns[i], pattern_set, pattern_pixels[i], pattern_frequencies[i]);
    }

    free(pattern_hashes);
    free(pattern_pixels);
    free(pattern_frequencies);

    // Check each tile against each other tile in each direction
    for (size_t pattern_a = 0; pattern_a < pattern_set->pattern_count; ++pattern_a)
    {
        for (size_t pattern_b = pattern_a; pattern_b < pattern_set->pattern_count; ++pattern_b)
        {
            for (Direction direction = 0; direction < 4; ++direction)
            {
                if (pattern_can_overlap(pattern_set, pattern_a, pattern_b, direction))
                {
                    pattern_overlap_add(&pattern_set->patterns[pattern_a], pattern_b, direction);
                    pattern_overlap_add(&pattern_set->patterns[pattern_b], pattern_a, get_opposite_direction(direction));
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

void pattern_set_draw(PatternSet *pattern_set)
{
    size_t draw_size = 60;
    size_t draw_gap = 40;
    size_t draw_scale = draw_size / pattern_set->pattern_dim;
    size_t grid_width = (SCREEN_WIDTH * 0.8) / (draw_size + draw_gap);
    size_t grid_height = pattern_set->pattern_count / grid_width + 1;

    for (size_t i = 0; i < pattern_set->pattern_count; ++i)
    {
        size_t x = i % grid_width;
        size_t y = i / grid_width;

        Vector2 draw_pos = {
            SCREEN_WIDTH / 2 - (grid_width * draw_size + (grid_width - 1) * draw_gap) / 2 + x * (draw_size + draw_gap),
            SCREEN_HEIGHT / 2 - (grid_height * draw_size + (grid_height - 1) * draw_gap) / 2 + y * (draw_size + draw_gap)};

        DrawTextureEx(pattern_set->patterns[i].texture, draw_pos, 0.0, draw_scale, WHITE);

        DrawText(TextFormat("%i", i), draw_pos.x + 10, draw_pos.y - 20, 15, LIGHTGRAY);
    }
}

// ------------------------

void cell_calculate_entropy(Cell *cell, PatternSet *pattern_set);

void cell_init(Cell *cell, WaveState *wave_state)
{
    // Initialize with all patterns allowed
    cell->allowed_pattern_count = wave_state->pattern_set->pattern_count;
    cell->allowed_pattern_list = malloc(cell->allowed_pattern_count * sizeof(size_t));
    for (size_t i = 0; i < cell->allowed_pattern_count; ++i)
    {
        cell->allowed_pattern_list[i] = i;
    }

    cell->is_visited = false;
    cell->is_collapsed = false;
    cell->entropy = 0;

    cell_calculate_entropy(cell, wave_state->pattern_set);
}

void cell_destroy(Cell *cell)
{
    free(cell->allowed_pattern_list);
}

void cell_block(Cell *cell, size_t list_index)
{
    // Remove the pattern from the list at the index
    // This is done by moving the last pattern to the index and decrementing the count
    cell->allowed_pattern_list[list_index] = cell->allowed_pattern_list[cell->allowed_pattern_count - 1];
    cell->allowed_pattern_count--;
}

void cell_calculate_entropy(Cell *cell, PatternSet *pattern_set)
{
    cell->entropy = cell->allowed_pattern_count;

    // Calculate the entropy of the cell using shannon entropy
    // cell->entropy = 0;

    // float total_frequency = 0;
    // for (size_t i = 0; i < cell->allowed_pattern_count; ++i)
    // {
    //     total_frequency += pattern_set->patterns[cell->allowed_pattern_list[i]].frequency;
    // }

    // for (size_t i = 0; i < cell->allowed_pattern_count; ++i)
    // {
    //     float frequency = pattern_set->patterns[cell->allowed_pattern_list[i]].frequency;
    //     float probability = frequency / total_frequency;
    //     cell->entropy -= probability * log2(probability);
    // }
}

// ------------------------

void wave_state_update_texture(WaveState *wave_state);

void wave_state_init(WaveState *wave_state, PatternSet *pattern_set)
{
    // Setup a new wave data output with the given pattern set
    wave_state->pattern_set = pattern_set;
    wave_state->width = RESULT_WIDTH;
    wave_state->height = RESULT_HEIGHT;
    wave_state->cells = malloc((wave_state->width * wave_state->height) * sizeof(Cell));

    Image image = GenImageColor(wave_state->width, wave_state->height, BLUE);
    wave_state->pixels = LoadImageColors(image);
    wave_state->texture = LoadTextureFromImage(image);
    UnloadImage(image);

    for (size_t i = 0; i < wave_state->width * wave_state->height; ++i)
    {
        wave_state->pixels[i] = PINK;
        cell_init(&wave_state->cells[i], wave_state);
    }

    wave_state_update_texture(wave_state);
}

void wave_state_destroy(WaveState *wave_state)
{
    for (size_t i_result = 0; i_result < wave_state->width * wave_state->height; ++i_result)
    {
        cell_destroy(&wave_state->cells[i_result]);
    }

    free(wave_state->cells);

    UnloadImageColors(wave_state->pixels);
    UnloadTexture(wave_state->texture);
}

int wave_state_get_best_cell(WaveState *wave_state)
{
    // Grab all the cells with the lowest entropy
    float min_entropy = INT_MAX;
    int *min_index_list = malloc((wave_state->width * wave_state->height) * sizeof(int));
    int min_index_count = -1;

    for (size_t i = 0; i < wave_state->width * wave_state->height; ++i)
    {
        if (wave_state->cells[i].is_collapsed)
            continue;

        float entropy = wave_state->cells[i].entropy;

        // Overwrite the list if a new minimum is found
        if (entropy < min_entropy)
        {
            min_entropy = entropy;
            min_index_list[0] = i;
            min_index_count = 1;
        }

        // Add to list if it matches
        else if (entropy == min_entropy)
        {
            min_index_list[min_index_count] = i;
            min_index_count++;
        }
    }

    // Choose a random cell from the list, or otherwise return -1
    size_t chosen = -1;

    if (min_index_count > 0)
    {
        chosen = min_index_list[rand() % min_index_count];
    }

    free(min_index_list);
    return chosen;
}

bool wave_state_propogate_entropy(WaveState *wave_state, size_t cell_index, int depth)
{
    Cell *cell = &wave_state->cells[cell_index];
    size_t cell_x = cell_index % wave_state->width;
    size_t cell_y = cell_index / wave_state->width;

    // Don't visit a cell if it is already visited
    if (depth > MAX_DEPTH || cell->is_visited)
        return true;

    cell->is_visited = true;

    // For each neighbour of the current cell
    for (Direction direction = 0; direction < 4; ++direction)
    {
        size_t nb_x = cell_x + NEIGHBOUR_DIRS[direction].x;
        size_t nb_y = cell_y + NEIGHBOUR_DIRS[direction].y;
        size_t nb_cell_index = nb_x + nb_y * wave_state->width;
        Cell *nb_cell = &wave_state->cells[nb_cell_index];

        // if it is within bounds and not collapsed
        if (nb_x < 0 || nb_x >= wave_state->width || nb_y < 0 || nb_y >= wave_state->height)
            continue;

        if (nb_cell->is_collapsed)
            continue;

        // For each pattern in the neighbour cell
        bool has_changed = false;
        size_t i = 0;
        while (i < nb_cell->allowed_pattern_count)
        {
            size_t nb_pattern = nb_cell->allowed_pattern_list[i];
            bool is_allowed = false;

            // For each pattern in this cell
            for (size_t j = 0; j < cell->allowed_pattern_count; ++j)
            {
                size_t cell_pattern = cell->allowed_pattern_list[j];

                // If an overlap is found then the neighbour pattern is allowed
                Pattern *pattern = &wave_state->pattern_set->patterns[cell_pattern];
                if (pattern_overlap_check(pattern, nb_pattern, direction))
                {
                    is_allowed = true;
                    break;
                }
            }

            // If no overlap then block and stay at same index
            if (!is_allowed)
            {
                cell_block(nb_cell, i);
                has_changed = true;
                continue;
            }

            i++;
        }

        // If the neighbour has changed continue propogation
        if (has_changed)
        {
            if (nb_cell->allowed_pattern_count == 0)
            {
                printf("Conflict at (%lld, %lld) from (%lld, %lld) which had %lld option(s)\n", nb_x, nb_y, cell_x, cell_y, cell->allowed_pattern_count);

                // size_t pattern_index = cell->allowed_pattern_list[0];
                // Pattern *pattern = &wave_state->pattern_set->patterns[pattern_index];
                // printf("Only pattern option for (%lld, %lld) was %lld\n", cell_x, cell_y, pattern_index);
                // for (size_t i = 0; i < wave_state->pattern_set->pattern_count; ++i)
                // {
                //     if (pattern->overlap_lookup[i] > 0)
                //     {
                //         printf("Overlap from %lld to %lld [%d %d %d %d]\n", pattern_index, i, pattern_overlap_check(pattern, i, 0), pattern_overlap_check(pattern, i, 1), pattern_overlap_check(pattern, i, 2), pattern_overlap_check(pattern, i, 3));
                //     }
                // }

                return false;
            }

            cell_calculate_entropy(nb_cell, wave_state->pattern_set);

            if (!wave_state_propogate_entropy(wave_state, nb_cell_index, depth + 1))
            {
                return false;
            }
        }
    }

    // All neighbours collapsed without conflict
    return true;
}

void wave_state_update_texture(WaveState *wave_state)
{
    // Calculate colour of each cell in the output
    size_t pos = wave_state->pattern_set->pattern_dim / 2;

    for (size_t i_cell = 0; i_cell < wave_state->width * wave_state->height; ++i_cell)
    {
        // If cell is collapsed then take the colour of the collapsed pattern
        if (wave_state->cells[i_cell].is_collapsed)
        {
            Pattern *pattern = &wave_state->pattern_set->patterns[wave_state->cells[i_cell].allowed_pattern_list[0]];
            Color pattern_color = pattern->pixels[pos + pos * wave_state->pattern_set->pattern_dim];
            wave_state->pixels[i_cell] = pattern_color;
        }

        // If cell is not collapsed but has no options then it is a conflict
        else if (wave_state->cells[i_cell].allowed_pattern_count == 0)
        {
            wave_state->pixels[i_cell] = CONFLICT_COLOR;
        }

        // Otherwise average the colour of each possible pattern
        else
        {
            unsigned int total_r = 0;
            unsigned int total_g = 0;
            unsigned int total_b = 0;
            unsigned int total_a = 0;

            for (size_t i_pattern = 0; i_pattern < wave_state->cells[i_cell].allowed_pattern_count; ++i_pattern)
            {
                Pattern *pattern = &wave_state->pattern_set->patterns[wave_state->cells[i_cell].allowed_pattern_list[i_pattern]];
                Color pattern_color = pattern->pixels[pos + pos * wave_state->pattern_set->pattern_dim];

                total_r += pattern_color.r;
                total_g += pattern_color.g;
                total_b += pattern_color.b;
                total_a += pattern_color.a;
            }

            Color average_color = {
                total_r / wave_state->cells[i_cell].allowed_pattern_count,
                total_g / wave_state->cells[i_cell].allowed_pattern_count,
                total_b / wave_state->cells[i_cell].allowed_pattern_count,
                total_a / wave_state->cells[i_cell].allowed_pattern_count};

            wave_state->pixels[i_cell] = average_color;
        }
    }

    UpdateTexture(wave_state->texture, wave_state->pixels);
}

int wave_state_collapse(WaveState *wave_state)
{
    for (size_t i = 0; i < wave_state->width * wave_state->height; ++i)
    {
        wave_state->cells[i].is_visited = 0;
    }

    // Grab the non-collapsed cell with the lowest entropy
    int best_cell_index = wave_state_get_best_cell(wave_state);

    // If no cell is returned then all are collapsed the wave is successful
    if (best_cell_index < 0)
    {
        printf("Completed due to no cells available\n");
        return false;
    }

    // Reduce the options of the best cell to a single random pattern
    Cell *best_cell = &wave_state->cells[best_cell_index];
    size_t chosen_pattern_index = rand() % best_cell->allowed_pattern_count;
    best_cell->allowed_pattern_list[0] = best_cell->allowed_pattern_list[chosen_pattern_index];
    best_cell->allowed_pattern_count = 1;

    // Propogate the entropy reduction between neighbours in the wave
    if (!wave_state_propogate_entropy(wave_state, best_cell_index, 0))
    {
        printf("Completed due to conflict\n");
        return false;
    }

    // Collapse any cells with 1 option and propogate entropy
    for (size_t i = 0; i < wave_state->width * wave_state->height; ++i)
    {
        if (wave_state->cells[i].allowed_pattern_count == 1)
        {
            wave_state->cells[i].is_collapsed = true;
            if (!wave_state_propogate_entropy(wave_state, best_cell_index, 0))
            {
                printf("Completed due to conflict\n");
                return false;
            }
        }
    }

    return true;
}

void wave_state_draw(WaveState *wave_state)
{
    // Draw the output wave state
    size_t draw_size = (SCREEN_HEIGHT * 0.75);
    size_t draw_scale = draw_size / wave_state->height;
    Vector2 draw_pos = {
        SCREEN_WIDTH / 2 - draw_size / 2,
        SCREEN_HEIGHT / 2 - draw_size / 2};

    DrawTextureEx(wave_state->texture, draw_pos, 0.0, draw_scale, WHITE);

    // Draw the number of states on each cell
    for (size_t y = 0; y < wave_state->height; ++y)
    {
        for (size_t x = 0; x < wave_state->width; ++x)
        {
            size_t cell = x + y * wave_state->width;
            size_t count = wave_state->cells[cell].allowed_pattern_count;

            if (count == 0)
            {
                DrawText("!!!", draw_pos.x + x * draw_scale + 10, draw_pos.y + y * draw_scale + 10, 20, LIGHTGRAY);
            }

            else if (!wave_state->cells[cell].is_collapsed)
            {
                DrawText(TextFormat("%i", count), draw_pos.x + x * draw_scale + 10, draw_pos.y + y * draw_scale + 10, 10, LIGHTGRAY);
            }
        }
    }
}

// ------------------------

int main()
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Overlapping WFC");
    srand(10);

    if (LIMIT_FPS)
    {
        SetTargetFPS(60);
    }

    PatternSet pattern_set;
    WaveState wave_state;

    pattern_set_init_from_image(&pattern_set, SAMPLE_PATH);
    wave_state_init(&wave_state, &pattern_set);

    int is_finished = 0;

    while (!WindowShouldClose())
    {
        BeginDrawing();

        ClearBackground(RAYWHITE);

        if (IsKeyPressed(KEY_SPACE))
        {
            wave_state_destroy(&wave_state);
            wave_state_init(&wave_state, &pattern_set);
            is_finished = false;
        }

        if (!is_finished)
        {
            is_finished = !wave_state_collapse(&wave_state);
            wave_state_update_texture(&wave_state);
        }

        wave_state_draw(&wave_state);

        DrawFPS(10, 10);
        DrawText(is_finished ? "Complete" : "Incomplete", 10, 30, 20, BLACK);

        EndDrawing();
    }

    wave_state_destroy(&wave_state);
    pattern_set_destroy(&pattern_set);
    CloseWindow();

    return 0;
}
