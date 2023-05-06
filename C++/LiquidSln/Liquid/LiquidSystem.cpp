
#include "stdafx.h"
#include "LiquidSystem.h"
#include "Utility.h"
#include "Window.h"


LiquidSystem::LiquidSystem() :
	circle(LiquidSystem::KERNEL_SIZE * 0.25f),
	particles()
{
	circle.setFillColor(sf::Color::Blue);
	circle.setOrigin(LiquidSystem::KERNEL_SIZE * 0.25f, LiquidSystem::KERNEL_SIZE * 0.25f);
}


void LiquidSystem::update(const float& dt)
{
	// Calculate pressure
	for (auto& pi : particles)
	{
		pi.density = 0.0f;
		for (auto& pj : particles)
		{
			sf::Vector2f diff = pj.pos - pi.pos;
			float dstSq = Utility::getLengthSq(diff);
			if (dstSq < KERNEL_SIZE_SQ)
			{
				// TODO: Check mass
				pi.density += pi.liquid->mass * SK_POLY6 * std::pow(KERNEL_SIZE_SQ - dstSq, 3.0f);
			}
		}
		pi.pressure = pi.liquid->gasConst * (pi.density - pi.liquid->restDensity);
	}

	// Calculate forces
	for (auto& pi : particles)
	{		
		for (auto& pj : particles)
		{
			if (&pi == &pj) continue;
			
			sf::Vector2f diff = pj.pos - pi.pos;
			float dst = Utility::getLength(diff);
			if (dst < KERNEL_SIZE)
			{
				// TODO: Check mass
				pi.force += -(diff / dst) * pi.liquid->mass * (pi.pressure + pj.pressure) / (2.0f * pj.density) * SK_SPIKY_GRAD * std::pow(KERNEL_SIZE - dst, 3.0f);

				// TODO: Check mass and viscosity
				pi.force += pi.liquid->viscosity * pi.liquid->mass * (pj.vel - pi.vel) / pj.density * SK_VISC_LAP * (KERNEL_SIZE - dst);
			}
		}

		// Apply gravity
		pi.force += sf::Vector2f{ 0.0f, 0.1f } * pi.liquid->mass / pi.density;
	}

	for (auto& pi : particles)
	{
		// Euler time step
		pi.vel *= GROUND_DAMP;
		pi.vel += dt * pi.force / pi.density;
		pi.pos += dt * pi.vel;
		pi.force = sf::Vector2f{ 0.0f, 0.0f };

		// Apply bounds
		if (pi.pos.x < KERNEL_SIZE / 2.0f)
		{
			pi.vel.x *= COLLISION_DAMP;
			pi.pos.x = KERNEL_SIZE / 2.0f;
		}
		if (pi.pos.x > (Window::WINDOW_WIDTH - KERNEL_SIZE / 2.0f))
		{
			pi.vel.x *= COLLISION_DAMP;
			pi.pos.x = (Window::WINDOW_WIDTH - KERNEL_SIZE / 2.0f);
		}
		if (pi.pos.y < KERNEL_SIZE / 2.0f)
		{
			pi.vel.y *= COLLISION_DAMP;
			pi.pos.y = KERNEL_SIZE / 2.0f;
		}
		if (pi.pos.y > (Window::WINDOW_HEIGHT - KERNEL_SIZE / 2.0f))
		{
			pi.vel.y *= COLLISION_DAMP;
			pi.pos.y = (Window::WINDOW_HEIGHT - KERNEL_SIZE / 2.0f);
		}
	}

}

void LiquidSystem::render(sf::RenderWindow* window)
{
	for (auto& p : particles)
	{
		circle.setPosition(p.pos);
		circle.setFillColor(p.liquid->color);
		window->draw(circle);
	}
}


void LiquidSystem::addLiquid(const Liquid* liquid, const sf::Vector2f& pos)
{
	particles.push_back(Particle(liquid, pos));
}

void LiquidSystem::addForce(sf::Vector2f pos, sf::Vector2f force, float range)
{
	for (auto& p : particles)
	{
		float dstSq = Utility::getLengthSq(p.pos - pos);
		if (dstSq < (range * range)) p.force += force;
	}
}

int LiquidSystem::getParticleCount()
{
	return particles.size();
}
