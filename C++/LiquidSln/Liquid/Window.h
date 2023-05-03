
#pragma once

#include "Entity.h"
#include "Game.h"


class Window {
public:
	Window();
	~Window();
	void run();

private:
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt;

	Game game;

	void update();
	void render();
};
