#pragma once
#include "raylib.h"
#include <vector>

enum class ParticleType : uint8_t
{
	EMPTY = 0,
	SAND = 1,
	WATER = 2
};

class ParticleGrid
{
public:
	ParticleGrid(int sizeX, int sizeY, int sizeZ, float gridSize);

	void update(float dt);
	void spawnAtTop(int x, int z, ParticleType type = ParticleType::SAND);
	void draw();

private:
	static constexpr float UPDATE_TIMESTEP = 0.05f;

	int sizeX, sizeY, sizeZ;
	float gridSize;
	float updateTimer;
	std::vector<ParticleType> grid;
	Mesh mesh;
	Material material;
	std::vector<Matrix> transforms;

	inline int index(int x, int y, int z) const
	{
		return (int)(x + sizeX * (y + sizeY * z));
	}

	static Color typeToColor(ParticleType t);
};
