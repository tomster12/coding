#pragma once

class Game
{
private:
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt;

	sf::CircleShape testCircle;

	void initVariables();
	void update();
	void render();

public:
	Game();
	~Game();
	void run();
};
