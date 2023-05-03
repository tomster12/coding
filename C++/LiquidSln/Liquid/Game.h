
#pragma once

#include "LiquidSystem.h"


class Game
{
public:
	Game();
	~Game();
	void update(const float& dt);
	void render(sf::RenderWindow* window);

private:
	sf::CircleShape circle;
	LiquidSystem liquidSystem;
};
