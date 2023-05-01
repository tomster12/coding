
#pragma once

#include "Entity.h"


class Game {
public:
	Game();
	~Game();
	void run();

private:
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt;

	std::vector<Entity> entities;

	void initVariables();
	void update();
	void render();
};
