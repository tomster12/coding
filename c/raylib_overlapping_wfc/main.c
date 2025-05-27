// cbuild: wfc.c -Wall -Werror -O3
// cbuild: -I../libs/raylib/include -L../libs/raylib/lib
// cbuild: -lraylib -lopengl32 -lgdi32 -lwinmm -lm

#include <stdio.h>
#include <stdlib.h>
#include "wfc.h"
#include "raylib.h"

int main()
{
    // Setup the raylib window
    size_t target_fps = 60;
    SetTraceLogLevel(LOG_WARNING);
    InitWindow(1000, 1200, "Overlapping WFC");
    SetTargetFPS(target_fps);

    // Initialize the WFC state
    WaveState wave_state;
    size_t output_width = 64;
    size_t output_height = 64;
    size_t pattern_dim = 3;
    size_t max_depth = 128;
    wave_state_init(&wave_state, "../samples/Flowers.png", output_width, output_height, pattern_dim, max_depth);

    // Main draw and update loop
    int status = 0;
    size_t tries = 1;
    float collapse_avg = 0;

    while (!WindowShouldClose())
    {
        BeginDrawing();

        ClearBackground(RAYWHITE);

        // Collapse the WFC as many times as possible in the allocated frame time
        double start = GetTime();
        double current = GetTime();
        size_t collapse_count = 0;

        while (status == 0 && (current - start) < (1.0 / target_fps - 0.01))
        {
            status = wave_state_collapse(&wave_state);
            current = GetTime();
            collapse_count++;
        }

        collapse_avg = (collapse_avg * 0.9) + (collapse_count * 0.1);

        // Restart on SPACE or if the WFC failed
        if (IsKeyPressed(KEY_SPACE) || (status == -1))
        {
            wave_state_restart(&wave_state);
            status = 0;
            tries++;

            if (IsKeyPressed(KEY_SPACE))
            {
                tries = 0;
            }
        }

        // Draw the WFC and information
        wave_state_draw(&wave_state, false);

        DrawFPS(10, 10);
        DrawText(status == 0 ? "Incomplete" : (status == -1 ? "Failed" : "Complete"), 10, 40, 20, BLACK);
        DrawText(TextFormat("Tries: %i", tries), 10, 60, 20, BLACK);
        DrawText(TextFormat("Total Collapses: %i", wave_state.collapse_counter), 10, 80, 20, BLACK);
        DrawText(status == 1 ? "Avg Collapses / Frame: N/A" : TextFormat("Avg Collapses / Frame: %d", (int)collapse_avg), 10, 100, 20, BLACK);
        DrawText("Press [SPACE] to restart", 10, 120, 20, BLACK);

        EndDrawing();
    }

    wave_state_destroy(&wave_state);

    CloseWindow();

    return 0;
}
