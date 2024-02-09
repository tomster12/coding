#pragma once

#include "World.h"
#include "PlayerController.h"

class Game;

class Simulation
{
public:
	Simulation(Game* game, sf::RenderWindow* window);
	~Simulation();
	void update();
	void render();

private:
	Game* game;
	sf::RenderWindow* window;

	World* world;
	PlayerController* playerController;
};
