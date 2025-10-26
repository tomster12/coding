#include <iostream>
#include "ParticleGrid.h"
#include "raymath.h"
#include "raylib.h"
#include "rlgl.h"

// ------------------ Public ------------------

ParticleGrid::ParticleGrid(int sizeX, int sizeY, int sizeZ, float gridSize)
	: grid((int)(sizeX* sizeY* sizeZ), ParticleType::EMPTY),
	sizeX(sizeX), sizeY(sizeY), sizeZ(sizeZ), gridSize(gridSize), updateTimer(0.0f)
{
	mesh = GenMeshCube(gridSize, gridSize, gridSize);

	Shader shader = LoadShader("instanced.vs", "instanced.fs");
	shader.locs[SHADER_LOC_MATRIX_MVP] = GetShaderLocation(shader, "mvp");
	shader.locs[SHADER_LOC_MATRIX_MODEL] = GetShaderLocationAttrib(shader, "model");

	material = LoadMaterialDefault();
	material.shader = shader;
}

void ParticleGrid::update(float dt)
{
	// Update at fixed timesteps
	updateTimer += dt;
	if (updateTimer < UPDATE_TIMESTEP) return;
	updateTimer -= UPDATE_TIMESTEP;

	// Loop upwards over the grid
	for (int y = 1; y < sizeY; ++y)
	{
		for (int z = 0; z < sizeZ; ++z)
		{
			for (int x = 0; x < sizeX; ++x)
			{
				int idx = index(x, y, z);
				if (grid[idx] == ParticleType::EMPTY) continue;

				// Try move downwards if empty
				int below = index(x, y - 1, z);
				if (grid[below] == ParticleType::EMPTY)
				{
					grid[below] = grid[idx];
					grid[idx] = ParticleType::EMPTY;
				}
				else
				{
					// Try move to each of [left, right, forward, back]
					if (x > 0 && grid[index(x - 1, y - 1, z)] == ParticleType::EMPTY)
					{
						grid[index(x - 1, y - 1, z)] = grid[idx];
						grid[idx] = ParticleType::EMPTY;
					}
					else if (x < sizeX - 1 && grid[index(x + 1, y - 1, z)] == ParticleType::EMPTY)
					{
						grid[index(x + 1, y - 1, z)] = grid[idx];
						grid[idx] = ParticleType::EMPTY;
					}
					else if (z > 0 && grid[index(x, y - 1, z - 1)] == ParticleType::EMPTY)
					{
						grid[index(x, y - 1, z - 1)] = grid[idx];
						grid[idx] = ParticleType::EMPTY;
					}
					else if (z < sizeZ - 1 && grid[index(x, y - 1, z + 1)] == ParticleType::EMPTY)
					{
						grid[index(x, y - 1, z + 1)] = grid[idx];
						grid[idx] = ParticleType::EMPTY;
					}
				}
			}
		}
	}
}

void ParticleGrid::draw()
{
	DrawGrid((int)sizeX, gridSize);

	transforms.clear();
	for (int y = 0; y < sizeY; ++y)
	{
		for (int z = 0; z < sizeZ; ++z)
		{
			for (int x = 0; x < sizeX; ++x)
			{
				ParticleType type = grid[index(x, y, z)];
				if (type == ParticleType::EMPTY) continue;

				float posX = (x - sizeX / 2.0f + 0.5f) * gridSize;
				float posY = (y + 0.5f) * gridSize;
				float posZ = (z - sizeZ / 2.0f + 0.5f) * gridSize;
				Matrix transform = MatrixTranslate(posX, posY, posZ);
				transforms.push_back(transform);
			}
		}
	}
	material.maps[MATERIAL_MAP_DIFFUSE].color = typeToColor(ParticleType::SAND);
	DrawMeshInstanced(mesh, material, transforms.data(), (int)transforms.size());
}

void ParticleGrid::spawnAtTop(int x, int z, ParticleType type)
{
	int y = sizeY - 1;
	if (grid[index(x, y, z)] == ParticleType::EMPTY)
	{
		grid[index(x, y, z)] = type;
	}
}

// ------------------ Public ------------------

Color ParticleGrid::typeToColor(ParticleType t)
{
	switch (t)
	{
	case ParticleType::SAND:  return ORANGE;
	case ParticleType::WATER: return BLUE;
	default: return BLACK;
	}
}
