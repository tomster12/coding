#pragma once
#include "Particle.h"
#include <vector>

class ParticleSystem
{
public:
	std::vector<Particle> particles;

	void addParticle(const Vector3& pos)
	{
		particles.emplace_back(pos);
	}

	void update(float dt)
	{
		for (auto& p : particles)
		{
			p.update(dt);
		}
	}

	void draw()
	{
		for (const auto& p : particles)
		{
			DrawSphere(p.position, p.radius, p.color);
		}
	}
};
