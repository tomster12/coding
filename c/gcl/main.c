// cbuild: -I../libs/sdl/include -L../libs/sdl/lib -I../libs/nuklear/include
// cbuild: -lSDL2 -lgdi32 -lwinmm -limm32 -lole32 -loleaut32 -lversion -luuid -lsetupapi -lopengl32

#define SDL_MAIN_HANDLED // Avoids SDL main which causes issues on Windows with WinMain
#define NK_INCLUDE_FIXED_TYPES // All of toggles enable various features in nuklear and are needed for nuklear_sdl_gl2
#define NK_INCLUDE_STANDARD_IO
#define NK_INCLUDE_STANDARD_VARARGS
#define NK_INCLUDE_DEFAULT_ALLOCATOR
#define NK_INCLUDE_VERTEX_BUFFER_OUTPUT
#define NK_INCLUDE_FONT_BAKING
#define NK_INCLUDE_DEFAULT_FONT
#define NK_IMPLEMENTATION // Needed for including the implementation of nuklear and nuklear_sdl_gl2 headers
#define NK_SDL_GL2_IMPLEMENTATION

#include <SDL2/SDL.h>
#include <SDL2/SDL_opengl.h>
#include "nuklear.h"
#include "nuklear_sdl_gl2.h"

typedef struct _State
{

	SDL_Window *sdl_win;
	SDL_GLContext *gl_ctx;
	struct nk_context *nk_ctx;
	int win_width, win_height;
	char input_buffer[64];
	char output_text[64];
	int option1;
	int option2;
	int option3;
} State;

void state_init(State* state)
{
	state->sdl_win = NULL;
	state->gl_ctx = NULL;
	state->nk_ctx = NULL;
	state->win_width = 0;
	state->win_height = 0;
	state->input_buffer[0] = '\0';
	state->output_text[0] = '\0';
	state->option1 = 0;
	state->option2 = 0;
	state->option3 = 0;
}

void app_init(State* state, char *title, size_t width, size_t height)
{
	// Config with OpenGL 2.2, VSync enabled, and high DPI support
	SDL_SetHint(SDL_HINT_VIDEO_HIGHDPI_DISABLED, "0");
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);

	enum SDL_WindowFlags flags = (SDL_WindowFlags)(SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN | SDL_WINDOW_ALLOW_HIGHDPI);

	// Initialize SDL, OpenGL, and Nuklear
	SDL_Init(SDL_INIT_VIDEO);
	state->sdl_win = SDL_CreateWindow(title, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, width, height, flags);
	state->gl_ctx = SDL_GL_CreateContext(state->sdl_win);
	state->nk_ctx = nk_sdl_init(state->sdl_win);

	// Load Nuklears default font and setup font atlas
	struct nk_font_atlas *atlas;
	nk_sdl_font_stash_begin(&atlas);
	nk_sdl_font_stash_end();
}

void app_deinit(State* state)
{
	// Deinitialize Nuklear, SDL, and OpenGL
	nk_sdl_shutdown();
	SDL_GL_DeleteContext(state->gl_ctx);
	SDL_DestroyWindow(state->sdl_win);
	SDL_Quit();
}

int handle_sdl_events(State* state)
{
	// Poll SDL events and forward to Nuklear
	// Handle nuklear window grab based on inputs
	// Return based on SDL_QUIT event

	SDL_Event evt;

	nk_input_begin(state->nk_ctx);

	while (SDL_PollEvent(&evt))
	{
		if (evt.type == SDL_QUIT)
			return 1;

		nk_sdl_handle_event(&evt);
	}

	nk_sdl_handle_grab();

	nk_input_end(state->nk_ctx);

	return 0;
}

int app_main(State* state)
{
	if (handle_sdl_events(state) == 1)
		return 1;

	if (nk_begin(state->nk_ctx, "Fullscreen", nk_rect(0, 0, state->win_width, state->win_height), NK_WINDOW_NO_SCROLLBAR))
	{
		nk_layout_row_dynamic(state->nk_ctx, 40, 1);
		nk_edit_string_zero_terminated(state->nk_ctx, NK_EDIT_SIMPLE, state->input_buffer, sizeof(state->input_buffer), nk_filter_default);

		nk_layout_row_dynamic(state->nk_ctx, 30, 1);
		nk_checkbox_label(state->nk_ctx, "Option 1", &state->option1);
		nk_checkbox_label(state->nk_ctx, "Option 2", &state->option2);
		nk_checkbox_label(state->nk_ctx, "Option 3", &state->option3);

		nk_layout_row_dynamic(state->nk_ctx, 100, 1);
		nk_label(state->nk_ctx, state->output_text, NK_TEXT_LEFT);
	}

	nk_end(state->nk_ctx);

	return 0;
}

void app_render(State* state)
{
	// Set background color with OpenGL into the SDL window
	glViewport(0, 0, state->win_width, state->win_height);
	glClear(GL_COLOR_BUFFER_BIT);

	// Render Nuklear into the SDL window and swap buffers
	nk_sdl_render(NK_ANTI_ALIASING_ON);
	SDL_GL_SwapWindow(state->sdl_win);
}

int main(int argc, char *argv[])
{
	State state;
	state_init(&state);

	app_init(&state, "gcl", 800, 600);

	while (1)
	{
		SDL_GetWindowSize(state.sdl_win, &state.win_width, &state.win_height);

		if (app_main(&state) == 1)
			break;

		app_render(&state);
	}

	app_deinit(&state);

	return 0;
}
