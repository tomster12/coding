#pragma once

struct Float2
{
	float x, y;
};

class Simulation
{
public:
	Simulation() {};
	Simulation(sf::RenderWindow* window);
	void update();
	void render();

private:
	sf::RenderWindow* window;

	size_t circlesCount;
	std::vector<Float2> circlesPos;
	sf::CircleShape circlesShape;
};
