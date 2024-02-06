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
	sf::Vector2i getMousePos() const { return mousePos; }
	sf::Vector2i getMousePosPrev() const { return mousePosPrev; }
	float getMouseScrollDelta() const { return mouseScrollDelta; }

private:
	sf::RenderWindow* window;
	sf::Clock dtClock;
	float dt = 0.0f;
	sf::Vector2i mousePos;
	sf::Vector2i mousePosPrev;
	float mouseScrollDelta = 0.0f;

	Simulation* sim;

	void update();
	void render();
};
