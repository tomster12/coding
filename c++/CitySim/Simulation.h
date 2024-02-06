#pragma once

#include <vector>
#include "QuadArray.h"
#include "Game.h"
#include "RoadNetwork.h"
#include "RoadRenderer.h"

class Game;

class Simulation
{
public:
	Simulation(Game* game);
	~Simulation();
	void update();
	void render();

private:
	Game* game;
	sf::RenderWindow* window = nullptr;
	sf::Vector2f baseViewSize;
	sf::View camView;
	sf::Vector2f camPos;
	sf::Vector2f camVel;
	float camZoom;
	float camZoomVel;

	//QuadArray quads;
	RoadNetwork* roadNetwork;
	RoadRenderer* roadRenderer;

	static const float CAM_POS_ACC;
	static const float CAM_POS_DRAG;
	static const float CAM_SCROLL_ACC;
	static const float CAM_SCROLL_DRAG;
	static const float QUAD_GAP;
	static const float QUAD_SIZE;
	static const sf::Color GRASS_COL;
};
