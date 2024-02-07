#pragma once

#include "Simulation.h"

class Simulation;

class Game
{
public:
	Game();
	~Game();
	void run();

	sf::RenderWindow* getWindow() { return window; }
	float getMouseScrollDelta() const { return mouseScrollDelta; }

private:
	sf::RenderWindow* window;
	sf::Clock dtClock;
	float dt = 0.0f;
	float mouseScrollDelta = 0.0f;

	Simulation* sim;

	void update();
	void render();
};
