
#include "raylib.h"

typedef struct Pattern
{
    Color *pixels;
    size_t frequency;
    unsigned char *overlaps;
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
    PatternSet pattern_set;
    size_t width;
    size_t height;
    size_t max_depth;
    size_t collapse_counter;
    CellState *cell_states;
    Color *pixels;
    Texture2D texture;
} WaveState;

void wave_state_init(WaveState *wave_state, const char *input_image_path, size_t width, size_t height, size_t pattern_dim, size_t max_depth);
void wave_state_destroy(WaveState *wave_state);
void wave_state_restart(WaveState *wave_state);
int wave_state_collapse(WaveState *wave_state);
void wave_state_draw(WaveState *wave_state, bool draw_cell_count);
