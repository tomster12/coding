// build: -Wall -Werror -I../libs/raylib/include -L../libs/raylib/lib -lraylib -lopengl32 -lgdi32 -lwinmm -lm

#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <math.h>
#include "raylib.h"

#define SCREEN_WIDTH 1000
#define SCREEN_HEIGHT 1200
#define LIMIT_FPS 60
#define RAND_SEED 1
#define SAMPLE_PATH "../samples/Flowers.png"
#define RESULT_WIDTH 64
#define RESULT_HEIGHT 64
#define MAX_DEPTH 256
#define PATTERN_DIM 3
#define PATTERN_WRAP true
#define PATTERN_PADDING_COLOR WHITE
#define DRAW_CONFLICT_COLOR BLUE
#define DRAW_CELL_COUNT false
#define RESTART_ON_CONFLICT true

// ------------------------

Vector2 NEIGHBOUR_DIRS[4] = {
    {1, 0}, {0, 1}, {-1, 0}, {0, -1}};

#define Direction unsigned char

Direction get_opposite_direction(Direction dir)
{
    return (dir + 2) % 4;
}

bool compare_colors(Color color_a, Color color_b)
{
    return color_a.r == color_b.r && color_a.g == color_b.g && color_a.b == color_b.b && color_a.a == color_b.a;
}

// ------------------------

typedef struct Pattern
{
    Color *pixels;
    size_t frequency;
    unsigned char *overlaps;
    Texture2D texture;
} Pattern;

typedef struct PatternSet
{
    Pattern *patterns;
    size_t pattern_count;
    size_t pattern_dim;
} PatternSet;

typedef struct CellState
{
    size_t *choices;
    size_t choice_count;
    size_t *stable_choices;
    size_t stable_choice_count;
    bool is_visited;
    bool is_changed;
    bool is_collapsed;
    float entropy;
} CellState;

typedef struct WaveState
{
    PatternSet *pattern_set;
    size_t width;
    size_t height;
    CellState *cell_states;
    Color *pixels;
    Texture2D texture;
    size_t collapse_counter;
} WaveState;

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
    pattern->overlaps = malloc(pattern_set->pattern_count * sizeof(unsigned char));
    for (size_t i = 0; i < pattern_set->pattern_count; ++i)
    {
        pattern->overlaps[i] = 0;
    }

    Image pattern_image = GenImageColor(pattern_set->pattern_dim, pattern_set->pattern_dim, PINK);
    pattern->texture = LoadTextureFromImage(pattern_image);
    UnloadImage(pattern_image);
    UpdateTexture(pattern->texture, pattern->pixels);
}

void pattern_destroy(Pattern *pattern)
{
    UnloadImageColors(pattern->pixels);
    free(pattern->overlaps);
    UnloadTexture(pattern->texture);
}

void pattern_overlap_add(Pattern *pattern, size_t index, Direction direction)
{
    pattern->overlaps[index] |= (1 << direction);
}

bool pattern_overlap_check(Pattern *pattern, size_t index, Direction direction)
{
    return (pattern->overlaps[index] & (1 << direction)) > 0;
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
    pattern_set->pattern_dim = PATTERN_DIM;

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

void cell_state_calculate_entropy(CellState *cell_state, PatternSet *pattern_set);

void cell_state_init(CellState *cell_state, WaveState *wave_state)
{
    // Initialize with all patterns allowed
    cell_state->choice_count = wave_state->pattern_set->pattern_count;
    cell_state->stable_choice_count = wave_state->pattern_set->pattern_count;

    cell_state->choices = malloc(cell_state->choice_count * sizeof(size_t));
    cell_state->stable_choices = malloc(cell_state->stable_choice_count * sizeof(size_t));

    for (size_t i = 0; i < cell_state->choice_count; ++i)
    {
        cell_state->choices[i] = i;
        cell_state->stable_choices[i] = i;
    }

    cell_state->is_visited = false;
    cell_state->is_changed = false;
    cell_state->is_collapsed = false;
    cell_state->entropy = 0;

    cell_state_calculate_entropy(cell_state, wave_state->pattern_set);
}

void cell_state_destroy(CellState *cell_state)
{
    free(cell_state->choices);
    free(cell_state->stable_choices);
}

void cell_state_block(CellState *cell_state, size_t choice)
{
    // Remove the pattern from the list at the index
    // This is done by moving the last pattern to the index and decrementing the count
    cell_state->choices[choice] = cell_state->choices[cell_state->choice_count - 1];
    cell_state->choice_count--;
    cell_state->is_changed = true;
}

void cell_state_reset_to_stable(CellState *cell_state)
{
    // Reset the cell to the stable state only if it has changed
    if (!cell_state->is_changed)
    {
        return;
    }

    cell_state->choice_count = cell_state->stable_choice_count;

    for (size_t i = 0; i < cell_state->choice_count; ++i)
    {
        cell_state->choices[i] = cell_state->stable_choices[i];
    }

    cell_state->is_changed = false;
}

void cell_state_save_as_stable(CellState *cell_state)
{
    // Save the current state as the stable state only if it has changed
    if (!cell_state->is_changed)
    {
        return;
    }

    cell_state->stable_choice_count = cell_state->choice_count;

    for (size_t i = 0; i < cell_state->choice_count; ++i)
    {
        cell_state->stable_choices[i] = cell_state->choices[i];
    }

    cell_state->is_changed = false;
}

void cell_state_calculate_entropy(CellState *cell_state, PatternSet *pattern_set)
{
    cell_state->entropy = cell_state->choice_count;

    // Calculate using shannon entropy
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

void wave_state_init(WaveState *wave_state, PatternSet *pattern_set)
{
    // Setup a new wave data output with the given pattern set
    wave_state->pattern_set = pattern_set;
    wave_state->width = RESULT_WIDTH;
    wave_state->height = RESULT_HEIGHT;
    wave_state->cell_states = malloc((wave_state->width * wave_state->height) * sizeof(CellState));
    wave_state->collapse_counter = 0;

    Image image = GenImageColor(wave_state->width, wave_state->height, BLUE);
    wave_state->pixels = LoadImageColors(image);
    wave_state->texture = LoadTextureFromImage(image);
    UnloadImage(image);

    for (size_t i = 0; i < wave_state->width * wave_state->height; ++i)
    {
        cell_state_init(&wave_state->cell_states[i], wave_state);
    }
}

void wave_state_destroy(WaveState *wave_state)
{
    for (size_t i_result = 0; i_result < wave_state->width * wave_state->height; ++i_result)
    {
        cell_state_destroy(&wave_state->cell_states[i_result]);
    }

    free(wave_state->cell_states);

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
        if (wave_state->cell_states[i].is_collapsed)
            continue;

        float entropy = wave_state->cell_states[i].entropy;

        // Overwrite the list if a new minimum is found
        if (entropy < min_entropy)
        {
            min_entropy = entropy;
            min_index_list[0] = i;
            min_index_count = 1;
        }

        // Add to list if it matches current elements
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
    CellState *cell_state = &wave_state->cell_states[cell_index];
    size_t cell_x = cell_index % wave_state->width;
    size_t cell_y = cell_index / wave_state->width;

    // Don't visit a cell if it is already visited
    if (depth > MAX_DEPTH || cell_state->is_visited)
    {
        return true;
    }

    cell_state->is_visited = true;

    // For each neighbour direction of the current cell
    for (Direction direction = 0; direction < 4; ++direction)
    {
        // Within bounds
        size_t nb_cell_x = cell_x + NEIGHBOUR_DIRS[direction].x;
        size_t nb_cell_y = cell_y + NEIGHBOUR_DIRS[direction].y;
        if (nb_cell_x < 0 || nb_cell_x >= wave_state->width || nb_cell_y < 0 || nb_cell_y >= wave_state->height)
        {
            continue;
        }

        // Not collapsed
        size_t nb_cell_index = nb_cell_x + nb_cell_y * wave_state->width;
        CellState *nb_cell_state = &wave_state->cell_states[nb_cell_index];
        if (nb_cell_state->is_collapsed)
        {
            continue;
        }

        // Check each of the neighbours patterns overlaps atleast 1 of this cells
        for (size_t i = 0; i < nb_cell_state->choice_count; ++i)
        {
            bool found = false;
            for (size_t j = 0; j < cell_state->choice_count && !found; ++j)
            {
                size_t cell_pattern_index = cell_state->choices[j];
                size_t nb_cell_pattern_index = nb_cell_state->choices[i];
                Pattern *cell_pattern = &wave_state->pattern_set->patterns[cell_pattern_index];
                found |= pattern_overlap_check(cell_pattern, nb_cell_pattern_index, direction);
            }

            // If none was found then block the pattern
            if (!found)
            {
                cell_state_block(nb_cell_state, i);
                i--;
            }
        }

        // Propogate the entropy if the neighbour is changed
        // Also have guards for checking the neighbour was reduced to 0 choices
        if (nb_cell_state->is_changed)
        {
            if (nb_cell_state->choice_count == 0)
            {
                return false;
            }

            cell_state_calculate_entropy(nb_cell_state, wave_state->pattern_set);

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
        if (wave_state->cell_states[i_cell].is_collapsed)
        {
            Pattern *pattern = &wave_state->pattern_set->patterns[wave_state->cell_states[i_cell].choices[0]];
            Color pattern_color = pattern->pixels[pos + pos * wave_state->pattern_set->pattern_dim];
            wave_state->pixels[i_cell] = pattern_color;
        }

        // If cell is not collapsed but has no options then it is a conflict
        else if (wave_state->cell_states[i_cell].choice_count == 0)
        {
            wave_state->pixels[i_cell] = DRAW_CONFLICT_COLOR;
        }

        // Otherwise average the colour of each possible pattern
        else
        {
            unsigned int total_r = 0;
            unsigned int total_g = 0;
            unsigned int total_b = 0;
            unsigned int total_a = 0;

            for (size_t i_pattern = 0; i_pattern < wave_state->cell_states[i_cell].choice_count; ++i_pattern)
            {
                Pattern *pattern = &wave_state->pattern_set->patterns[wave_state->cell_states[i_cell].choices[i_pattern]];
                Color pattern_color = pattern->pixels[pos + pos * wave_state->pattern_set->pattern_dim];

                total_r += pattern_color.r;
                total_g += pattern_color.g;
                total_b += pattern_color.b;
                total_a += pattern_color.a;
            }

            Color average_color = {
                total_r / wave_state->cell_states[i_cell].choice_count,
                total_g / wave_state->cell_states[i_cell].choice_count,
                total_b / wave_state->cell_states[i_cell].choice_count,
                total_a / wave_state->cell_states[i_cell].choice_count};

            wave_state->pixels[i_cell] = average_color;
        }
    }

    UpdateTexture(wave_state->texture, wave_state->pixels);
}

int wave_state_collapse(WaveState *wave_state)
{
    // Grab the non-collapsed cell with the lowest entropy
    int best_cell_index = wave_state_get_best_cell(wave_state);

    // If no cell is returned then all are collapsed the wave is successful
    if (best_cell_index < 0)
    {
        printf("Completed due to all cells collapsed\n");
        return 1;
    }

    // Copy all of the possible choices
    CellState *best_cell = &wave_state->cell_states[best_cell_index];
    size_t *remaining_choices = malloc(best_cell->choice_count * sizeof(size_t));
    size_t remaining_choice_count = best_cell->choice_count;
    for (size_t i = 0; i < best_cell->choice_count; ++i)
    {
        remaining_choices[i] = best_cell->choices[i];
    }

    // While there are possible choices
    bool success = false;
    while (remaining_choice_count > 0)
    {
        // Pick one at random and remove from the list
        size_t choice = rand() % remaining_choice_count;
        best_cell->choices[0] = remaining_choices[choice];
        best_cell->choice_count = 1;
        best_cell->is_changed = true;
        remaining_choices[choice] = remaining_choices[remaining_choice_count - 1];
        remaining_choice_count--;

        // Propogate the entropy reduction between neighbours in the wave
        success = wave_state_propogate_entropy(wave_state, best_cell_index, 0);

        // Successfull so mark as collapsed and exit
        if (success)
        {
            best_cell->is_collapsed = true;
            break;
        }

        // There was a conflict so reset all the states back to the stable state0
        else
        {
            for (size_t i = 0; i < wave_state->width * wave_state->height; ++i)
            {
                wave_state->cell_states[i].is_visited = false;
                cell_state_reset_to_stable(&wave_state->cell_states[i]);
            }
        }
    }

    free(remaining_choices);

    // None of the choices were successful
    if (!success)
    {
        printf("Completed due to none of the choices having no conflicts\n");
        return -1;
    }

    // There was a successfull choice so save the new stable state configuration
    wave_state->collapse_counter++;

    for (size_t i = 0; i < wave_state->width * wave_state->height; ++i)
    {
        wave_state->cell_states[i].is_visited = false;
        cell_state_save_as_stable(&wave_state->cell_states[i]);
    }

    return 0;
}

void wave_state_draw(WaveState *wave_state)
{
    wave_state_update_texture(wave_state);

    // Draw the output wave state
    size_t draw_size = (SCREEN_WIDTH * 0.8);
    size_t draw_scale = draw_size / wave_state->height;
    Vector2 draw_pos = {
        SCREEN_WIDTH / 2 - draw_size / 2,
        SCREEN_HEIGHT / 2 - draw_size / 2};

    DrawTextureEx(wave_state->texture, draw_pos, 0.0, draw_scale, WHITE);

    // Draw the number of states on each cell
    if (DRAW_CELL_COUNT)
    {
        for (size_t y = 0; y < wave_state->height; ++y)
        {
            for (size_t x = 0; x < wave_state->width; ++x)
            {
                size_t cell = x + y * wave_state->width;
                size_t count = wave_state->cell_states[cell].choice_count;

                if (count == 0)
                {
                    DrawText("!!!", draw_pos.x + x * draw_scale + 10, draw_pos.y + y * draw_scale + 10, 20, LIGHTGRAY);
                }
                else if (!wave_state->cell_states[cell].is_collapsed)
                {
                    DrawText(TextFormat("%i", count), draw_pos.x + x * draw_scale + 10, draw_pos.y + y * draw_scale + 10, 10, LIGHTGRAY);
                }
            }
        }
    }
}

// ------------------------

int main()
{
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Overlapping WFC");
    SetTargetFPS(LIMIT_FPS);

    if (RAND_SEED != -1)
    {
        srand(RAND_SEED);
    }

    // Initialize the WFC pattern set and state
    PatternSet pattern_set;
    WaveState wave_state;

    pattern_set_init_from_image(&pattern_set, SAMPLE_PATH);
    wave_state_init(&wave_state, &pattern_set);

    int wfc_res = 0;
    float wfc_update_avg = 0;

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(RAYWHITE);

        // Each draw frame run the WFC algorithm as much as possible
        // Allocate 0.01 seconds to the rest of the frame (to keep at LIMIT_FPS)
        double start = GetTime();
        double current = GetTime();
        size_t update_count = 0;
        while (wfc_res == 0 && (current - start) < (1.0 / LIMIT_FPS - 0.01))
        {
            wfc_res = wave_state_collapse(&wave_state);
            current = GetTime();
            update_count++;
        }

        // Update the average update count
        wfc_update_avg = (wfc_update_avg * 0.9) + (update_count * 0.1);

        // Reset on space or on conflict
        if (IsKeyPressed(KEY_SPACE) || (RESTART_ON_CONFLICT && wfc_res == -1))
        {
            wave_state_destroy(&wave_state);
            wave_state_init(&wave_state, &pattern_set);
            wfc_res = 0;
        }

        wave_state_draw(&wave_state);

        DrawFPS(10, 10);
        DrawText(wfc_res == 0 ? "Incomplete" : (wfc_res == -1 ? "Failed" : "Complete"), 10, 30, 20, BLACK);
        DrawText(TextFormat("Collapses: %i", wave_state.collapse_counter), 10, 50, 20, BLACK);
        DrawText(TextFormat("Updates: %f", wfc_update_avg), 10, 70, 20, BLACK);
        DrawText("Press [SPACE] to restart", 10, 90, 20, BLACK);
        EndDrawing();
    }

    wave_state_destroy(&wave_state);
    pattern_set_destroy(&pattern_set);
    CloseWindow();

    return 0;
}
