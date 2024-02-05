#pragma once
#include "Simulation.h"

class Game
{
public:
	Game();
	~Game();
	void run();

private:
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt;

	Simulation sim;

	void init();
	void update();
	void render();
};
