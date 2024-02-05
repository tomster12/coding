#include "stdafx.h"
#include "Simulation.h"
#include <random>

Simulation::Simulation(sf::RenderWindow* window)
	:window(window)
{
	const int size = 5.0f;
	const sf::Vector2u windowSize = window->getSize();
	int countX = windowSize.x / size;
	int countY = windowSize.y / size;

	circlesCount = countX * countY;
	circlesPos = std::vector<Float2>(circlesCount);
	std::cout << "Making " << countX << ", " << countY << " (" << circlesCount << ") circles" << std::endl;

	for (size_t i = 0; i < circlesCount; ++i)
	{
		int x = i / countX;
		int y = i % countY;
		circlesPos[i] = Float2{ x * size + size / 2.0f, y * size + size / 2.0f };
	}

	circlesShape = sf::CircleShape(size / 2.0f);
	circlesShape.setOrigin(size / 2.0f, size / 2.0f);

	srand(time(NULL));
}

void Simulation::update()
{
	for (size_t i = 0; i < circlesCount; ++i)
	{
		circlesPos[i].x += ((float)rand() / RAND_MAX) * 4.0f - 2.0f;
		circlesPos[i].y += ((float)rand() / RAND_MAX) * 4.0f - 2.0f;
	}
}

void Simulation::render()
{
	for (size_t i = 0; i < circlesCount; ++i)
	{
		circlesShape.setPosition(circlesPos[i].x, circlesPos[i].y);
		window->draw(circlesShape);
	}
}
