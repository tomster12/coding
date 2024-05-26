#pragma once

#include "DrawQueue.h"
#include "Simulation.h"
#include "PlayerController.h"

class Simulation;

class Game
{
public:
	Game();
	~Game();
	void run();

	sf::Vector2i getMousePos() const { return mousePos; }
	sf::Vector2i getMousePosPrev() const { return mousePosPrev; }
	float getMouseScrollDelta() const { return mouseScrollDelta; }
	sf::RenderWindow* const getWindow() const { return window; }
	void setClearColor(sf::Color color) { clearColor = color; }
	void setView(sf::View& view) { window->setView(view); }

private:
	sf::RenderWindow* window;
	sf::Color clearColor;
	sf::Clock dtClock;
	float dt = 0.0f;
	sf::Vector2i mousePos;
	sf::Vector2i mousePosPrev;
	float mouseScrollDelta = 0.0f;

	Simulation* sim;
	PlayerController* playerController;

	void update();
	void render();
};
