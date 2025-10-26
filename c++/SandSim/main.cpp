#include <vector>
#include "raylib.h"
#include "rlgl.h"
#include "ParticleGrid.h"

#define GRID_SIZE_X 32
#define GRID_SIZE_Y 32
#define GRID_SIZE_Z 32
#define GRID_SIZE 0.1f
#define SCREEN_HEIGHT 1080
#define SCREEN_WIDTH 1920
#define SCREEN_HEIGHT 1080
#define SPAWN_TIMESTEP 0.1f

int main()
{
	InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Sand Simulation");
	SetTargetFPS(120);
	DisableCursor();

	Camera3D camera = { 0 };
	camera.position = { 2, 1, 2 };
	camera.target = { 0, 1, 0 };
	camera.up = { 0, 1, 0 };
	camera.fovy = 80;
	camera.projection = CAMERA_PERSPECTIVE;

	ParticleGrid grid(GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z, GRID_SIZE);
	float spawnTimer = 0.0f;

	while (!WindowShouldClose())
	{
		// -------------------- Update --------------------

		float dt = GetFrameTime();

		spawnTimer += dt;
		if (spawnTimer > SPAWN_TIMESTEP)
		{
			grid.spawnAtTop(15, 15, ParticleType::SAND);
			spawnTimer = 0;
		}

		grid.update(dt);

		// -------------------- Render --------------------

		UpdateCamera(&camera, CAMERA_FIRST_PERSON);

		BeginDrawing();
		ClearBackground(RAYWHITE);

		BeginMode3D(camera);
		grid.draw();
		EndMode3D();

		DrawFPS(10, 10);
		EndDrawing();
	}

	CloseWindow();
	return 0;
}
