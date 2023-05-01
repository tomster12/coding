
#include "stdafx.h"
#include "Particle.h"


Particle::Particle(sf::Vector2f pos, float radius, sf::Color col) :
	circle(radius)
{
	this->circle.setPosition(pos);
	this->circle.setFillColor(col);
}

void Particle::render(sf::RenderWindow* window)
{
	std::cout << "Hello\n";
	window->draw(this->circle);
}
