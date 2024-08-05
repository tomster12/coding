#pragma once

class Game
{
private:
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt;

	sf::CircleShape testCircle;

	void update();
	void render();

public:
	Game();
	~Game();
	void run();
};
