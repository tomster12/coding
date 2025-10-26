#pragma once
#include "raylib.h"

struct Particle
{
	Vector3 position;
	Vector3 velocity;
	float radius;
	Color color;

	Particle(const Vector3& pos)
		: position(pos), velocity({ 0, 0, 0 }), radius(0.1f), color(ORANGE)
	{}

	void update(float dt)
	{
		// Gravity
		velocity.y -= 9.81f * dt;

		// Dynamics
		position.y += velocity.y * dt;

		// Ground collision
		if (position.y < 0)
		{
			position.y = 0;
			velocity.y *= -0.3f;
		}
	}
};
