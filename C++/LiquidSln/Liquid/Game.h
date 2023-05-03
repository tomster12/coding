
#pragma once


class Game
{
public:
	Game();
	~Game();
	void update();
	void render(sf::RenderWindow* window);

private:
	sf::CircleShape circle;
};
