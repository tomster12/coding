#pragma once

struct DrawQueueEntry
{
	float zIndex;
	sf::Drawable* drawable;
};

class DrawQueue
{
public:
	void queue(float zIndex, sf::Drawable* drawable);
	void render(sf::RenderWindow* window);
	void clear();

private:
	std::vector<DrawQueueEntry> draws;
};
