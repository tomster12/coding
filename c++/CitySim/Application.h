#pragma once

#include "DrawQueue.h"
#include "Simulation.h"
#include "Player.h"

class Simulation;

class Application
{
public:
	Application();
	~Application();

	int run();

	sf::Vector2i getMousePos() const { return mousePos; }
	sf::Vector2i getMousePosPrev() const { return mousePosPrev; }
	float getMouseScrollDelta() const { return mouseScrollDelta; }
	sf::RenderWindow* const getWindow() const { return window; }
	void setClearColor(sf::Color color) { clearColor = color; }
	void setView(sf::View& view) { window->setView(view); }

private:
	sf::RenderWindow* window;
	Simulation* sim;
	Player* player;

	sf::Color clearColor;
	sf::Clock dtClock;
	float dt = 0.0f;
	sf::Vector2i mousePos;
	sf::Vector2i mousePosPrev;
	float mouseScrollDelta = 0.0f;
	DrawQueue drawQueue;

	void update();
	void queueRenders();
};
