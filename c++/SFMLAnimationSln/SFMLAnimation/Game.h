
#pragma once
#include "Player.h"


class Game {

private:
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt;

	Player* player;

	void initVariables();
	void update();
	void render();

public:
	Game();
	~Game();

	void run();
};