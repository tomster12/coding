// build: -I../libs/SDL3-3.2.4/x86_64-w64-mingw32/include -L../libs/SDL3-3.2.4/x86_64-w64-mingw32/lib -lSDL3

#include <SDL3/SDL.h>
#include <stdio.h>

int main()
{
    printf("Start\n");

    // Initialize SDL
    if (SDL_Init(SDL_INIT_VIDEO) < 0)
    {
        printf("SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
        return 1;
    }

    // Create a window
    SDL_Window *window = SDL_CreateWindow("SDL3 Test", 800, 600, SDL_WINDOW_RESIZABLE);
    if (!window)
    {
        printf("Window could not be created! SDL_Error: %s\n", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    // Event loop
    SDL_Event event;
    int running = 1;
    while (running)
    {
        while (SDL_PollEvent(&event))
        {
            if (event.type == SDL_EVENT_QUIT)
            {
                running = 0;
            }
        }
    }

    printf("Done\n");

    // Cleanup
    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}
