
#pragma once

#include "Game.h"


class Window {
public:
	static constexpr int WINDOW_WIDTH = 1200;
	static constexpr int WINDOW_HEIGHT = 900;
	static constexpr char WINDOW_TITLE[] = "Liquid Simulation";

	Window();
	~Window();
	void run();
	sf::RenderWindow* getWindow();
	
private:
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt;
	Game game;

	void update();
	void render();
};
