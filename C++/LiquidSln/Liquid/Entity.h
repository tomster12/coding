
#pragma once


class Entity
{
public:
	virtual void update() { }
	virtual void render(sf::RenderWindow* window) { }
};
