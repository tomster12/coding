
#include "stdafx.h"
#include "LiquidSystem.h"
#include "Utility.h"


LiquidSystem::LiquidSystem() :
	circle(LiquidSystem::DROP_RADIUS),
	drops()
{
	circle.setFillColor(sf::Color::Transparent);
	circle.setOutlineThickness(1.0f);
}


void LiquidSystem::update(const float& dt)
{
	for (size_t i = 0; i < drops.size() - 1; i++)
	{
		Drop& d0 = drops[i];
		for (size_t j = i + 1; j < drops.size(); j++)
		{
			Drop& d1 = drops[j];
			
			float dx = d1.pos.x - d0.pos.x;
			float dy = d1.pos.y - d0.pos.y;
			float dst = sqrt(dx * dx + dy * dy);
			float dirx = dx / dst;
			float diry = dy / dst;
			float dstNorm = fmax(0.1f, dst / (LiquidSystem::DROP_RADIUS * 2.0f));

			if (dst < (LiquidSystem::DROP_RADIUS * 2.0f))
			{
				if (dst == 0.0f)
				{
					float angle = Utility::random(0.0f, 2.0f * Utility::PI);
					dirx = cos(angle);
					diry = sin(angle);
				}

				float force = dt * (LiquidSystem::DROP_REPEL_FORCE / dstNorm);
				d0.vel.x -= dirx * force;
				d0.vel.y -= diry * force;
				d1.vel.x += dirx * force;
				d1.vel.y += diry * force;
			}

			else if (dst < (LiquidSystem::DROP_RADIUS * 2.0f + LiquidSystem::DROP_ATTRACT_DIST))
			{
				float force = dt * (LiquidSystem::DROP_ATTRACT_FORCE / dstNorm);
				d0.vel.x += dirx * force;
				d0.vel.y += diry * force;
				d1.vel.x -= dirx * force;
				d1.vel.y -= diry * force;
			}
		}
		
		d0.pos.x += d0.vel.x * dt;
		d0.pos.y += d0.vel.y * dt;
		d0.vel.x *= LiquidSystem::DROP_DRAG;
		d0.vel.y *= LiquidSystem::DROP_DRAG;
	}
}

void LiquidSystem::render(sf::RenderWindow* window)
{
	for (auto& drop : drops)
	{
		circle.setPosition(drop.pos);
		circle.setOutlineColor(drop.liquid->color);
		window->draw(circle);
	}
}


void LiquidSystem::addLiquid(const Liquid* liquid, const sf::Vector2f& pos)
{
	drops.push_back({ liquid, pos });
}
