#include "stdafx.h"
#include "Simulation.h"

Simulation::Simulation(Game* game, sf::RenderWindow* window)
	: game(game), window(window)
{
	world = new World(game, window, this);
	playerController = new PlayerController(game, window, this, world);
}

Simulation::~Simulation()
{
	delete world;
	delete playerController;
}

void Simulation::update()
{
	world->update();
	playerController->update();
}

void Simulation::render()
{
	world->render();
	playerController->render();
}
