#pragma once

struct QueuedDraw
{
	float zIndex;
	sf::Drawable* drawable;
};

class DrawQueue
{
public:
	void queue(QueuedDraw draw);
	void render(sf::RenderWindow* window);

private:
	std::vector<QueuedDraw> draws;
};
