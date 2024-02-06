#include "stdafx.h"
#include "Simulation.h"
#include <random>

const float Simulation::CAM_POS_ACC = 0.13f;
const float Simulation::CAM_POS_DRAG = 0.8f;
const float Simulation::QUAD_GAP = 2.0f;
const float Simulation::QUAD_SIZE = 5.0f;
const float Simulation::CAM_SCROLL_ACC = 0.04f;
const float Simulation::CAM_SCROLL_DRAG = 0.8f;

Simulation::Simulation(Game* game)
	: game(game), window(game->getWindow())
{
	srand((size_t)time(NULL));

	// Initialize view of the world
	baseViewSize = (sf::Vector2f)window->getSize();
	camView = sf::View(sf::FloatRect(0.0f, 0.0f, baseViewSize.x, baseViewSize.y));
	camPos = baseViewSize / 2.0f;
	camVel = { 0.0f, 0.0f };
	camZoom = 1.0f;
	camZoomVel = 0.0f;

	// Initialize all quads in a screen size grid
	int countX = (int)(baseViewSize.x / (QUAD_SIZE + QUAD_GAP));
	int countY = (int)(baseViewSize.y / (QUAD_SIZE + QUAD_GAP));
	size_t count = countX * countY;
	quads = QuadArray(count, QUAD_SIZE);
	for (size_t i = 0; i < count; ++i)
	{
		quads.setPosition(i,
			QUAD_GAP / 2.0f + (int)(static_cast<float>(i) / countY) * (QUAD_SIZE + QUAD_GAP),
			QUAD_GAP / 2.0f + (i % countY) * (QUAD_SIZE + QUAD_GAP)
		);
	}

	// Reference cicle
	//referenceCircle = sf::CircleShape(20.0f);
	//referenceCircle.setOrigin(20.0f / 2.0f, 25.0f / 2.0f);
	//referenceCircle.setPosition(baseViewSize.x / 2.0f, baseViewSize.y / 2.0f);
}

void Simulation::update()
{
	// Handle camera movement and zoom
	if (sf::Mouse::isButtonPressed(sf::Mouse::Left))
	{
		camVel.x += (game->getMousePosPrev().x - game->getMousePos().x) * CAM_POS_ACC * camZoom;
		camVel.y += (game->getMousePosPrev().y - game->getMousePos().y) * CAM_POS_ACC * camZoom;
	}
	camZoomVel = (game->getMouseScrollDelta() != 0 ? -game->getMouseScrollDelta() : camZoomVel);
	camPos.x += camVel.x;
	camPos.y += camVel.y;
	camZoom *= (1.0f + camZoomVel * CAM_SCROLL_ACC);
	camVel.x *= CAM_POS_DRAG;
	camVel.y *= CAM_POS_DRAG;
	camZoomVel *= CAM_SCROLL_DRAG;
	camView.setCenter(camPos);
	camView.setSize(baseViewSize * camZoom);

	// Randomly move quads
	for (size_t i = 0; i < quads.getCount(); ++i)
	{
		const sf::Vector2f& pos = quads.getPosition(i);
		quads.setPosition(i,
			pos.x + ((float)rand() / RAND_MAX) * 2.0f - 1.0f,
			pos.y + ((float)rand() / RAND_MAX) * 2.0f - 1.0f
		);
	}
}

void Simulation::render()
{
	window->setView(camView);

	quads.render(window);

	//window->draw(referenceCircle);
}
