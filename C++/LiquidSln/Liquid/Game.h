
#pragma once

#include "LiquidSystem.h"


class Window;

class Game
{
public:
	Game() = delete;
	Game(Window* window);
	void update(const float& dt);
	void render();

private:
	Window* window = nullptr;
	int frameCount = 0;
	sf::Vector2i prevMousePos;
	sf::Vector2i mousePos;
	LiquidSystem liquidSystem;
};
