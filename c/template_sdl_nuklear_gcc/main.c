// build: -I../libs/sdl/include -L../libs/sdl/lib -I../libs/nuklear/include
// build: -lSDL2 -lgdi32 -lwinmm -limm32 -lole32 -loleaut32 -lversion -luuid -lsetupapi -lopengl32

#define SDL_MAIN_HANDLED	   // Avoids SDL main which causes issues on Windows with WinMain
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

struct nk_colorf bg = {0.10f, 0.18f, 0.24f, 1.0f};
int choice = 0;
int property = 20;

void app_init(SDL_Window **sdl_win, SDL_GLContext **gl_ctx, struct nk_context **nk_ctx, char *title, size_t width, size_t height)
{
	// Config with OpenGL 2.2, VSync enabled, and high DPI support
	SDL_SetHint(SDL_HINT_VIDEO_HIGHDPI_DISABLED, "0");
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);

	enum SDL_WindowFlags flags = (SDL_WindowFlags)(SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN | SDL_WINDOW_ALLOW_HIGHDPI);

	// Initialize SDL, OpenGL, and Nuklear
	SDL_Init(SDL_INIT_VIDEO);
	*sdl_win = SDL_CreateWindow(title, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, width, height, flags);
	*gl_ctx = SDL_GL_CreateContext(*sdl_win);
	*nk_ctx = nk_sdl_init(*sdl_win);

	// Load Nuklears default font and setup font atlas
	struct nk_font_atlas *atlas;
	nk_sdl_font_stash_begin(&atlas);
	nk_sdl_font_stash_end();
}

void app_deinit(SDL_Window *sdl_win, SDL_GLContext *gl_ctx, struct nk_context *nk_ctx)
{
	// Deinitialize Nuklear, SDL, and OpenGL
	nk_sdl_shutdown();
	SDL_GL_DeleteContext(gl_ctx);
	SDL_DestroyWindow(sdl_win);
	SDL_Quit();
}

int handle_sdl_events(struct nk_context *nk_ctx)
{
	// Poll SDL events and forward to Nuklear
	// Handle nuklear window grab based on inputs
	// Return based on SDL_QUIT event

	SDL_Event evt;

	nk_input_begin(nk_ctx);

	while (SDL_PollEvent(&evt))
	{
		if (evt.type == SDL_QUIT)
			return 1;

		nk_sdl_handle_event(&evt);
	}

	nk_sdl_handle_grab();

	nk_input_end(nk_ctx);

	return 0;
}

int app_main(struct nk_context *nk_ctx)
{
	if (handle_sdl_events(nk_ctx) == 1)
		return 1;

	if (nk_begin(
			nk_ctx, "Example Window",
			nk_rect(50, 50, 230, 250),
			NK_WINDOW_BORDER | NK_WINDOW_MOVABLE | NK_WINDOW_SCALABLE | NK_WINDOW_MINIMIZABLE | NK_WINDOW_TITLE))
	{
		nk_layout_row_static(nk_ctx, 30, 80, 1);
		if (nk_button_label(nk_ctx, "button"))
			fprintf(stdout, "button pressed\n");

		nk_layout_row_dynamic(nk_ctx, 30, 2);
		if (nk_option_label(nk_ctx, "easy", choice == 0))
			choice = 0;
		if (nk_option_label(nk_ctx, "hard", choice == 1))
			choice = 1;

		nk_layout_row_dynamic(nk_ctx, 25, 1);
		nk_property_int(nk_ctx, "Compression:", 0, &property, 100, 10, 1);

		nk_layout_row_dynamic(nk_ctx, 20, 1);
		nk_label(nk_ctx, "background:", NK_TEXT_LEFT);

		nk_layout_row_dynamic(nk_ctx, 25, 1);
		if (nk_combo_begin_color(nk_ctx, nk_rgb_cf(bg), nk_vec2(nk_widget_width(nk_ctx), 400)))
		{
			nk_layout_row_dynamic(nk_ctx, 120, 1);
			bg = nk_color_picker(nk_ctx, bg, NK_RGBA);

			nk_layout_row_dynamic(nk_ctx, 25, 1);
			bg.r = nk_propertyf(nk_ctx, "#R:", 0, bg.r, 1.0f, 0.01f, 0.005f);
			bg.g = nk_propertyf(nk_ctx, "#G:", 0, bg.g, 1.0f, 0.01f, 0.005f);
			bg.b = nk_propertyf(nk_ctx, "#B:", 0, bg.b, 1.0f, 0.01f, 0.005f);
			bg.a = nk_propertyf(nk_ctx, "#A:", 0, bg.a, 1.0f, 0.01f, 0.005f);
			nk_combo_end(nk_ctx);
		}
	}

	nk_end(nk_ctx);

	return 0;
}

void app_render(SDL_Window *sdl_win)
{
	// Set background color with OpenGL into the SDL window
	int win_width, win_height;
	SDL_GetWindowSize(sdl_win, &win_width, &win_height);
	glViewport(0, 0, win_width, win_height);
	glClear(GL_COLOR_BUFFER_BIT);
	glClearColor(bg.r, bg.g, bg.b, bg.a);

	// Render Nuklear into the SDL window and swap buffers
	nk_sdl_render(NK_ANTI_ALIASING_ON);
	SDL_GL_SwapWindow(sdl_win);
}

int main(int argc, char *argv[])
{
	SDL_Window *sdl_win;
	SDL_GLContext *gl_ctx;
	struct nk_context *nk_ctx;

	app_init(&sdl_win, &gl_ctx, &nk_ctx, "SDL Nuklear Demo", 800, 600);

	while (1)
	{
		if (app_main(nk_ctx) == 1)
			break;

		app_render(sdl_win);
	}

	app_deinit(sdl_win, gl_ctx, nk_ctx);

	return 0;
}
