#pragma once

#include "Entity.h"


class Particle : public Entity
{
public:
	Particle(sf::Vector2f pos, float radius, sf::Color col);
	void render(sf::RenderWindow* window) override;

private:
	sf::CircleShape circle;
};
