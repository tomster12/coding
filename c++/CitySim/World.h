#pragma once

#include "DrawQueue.h"
#include "Game.h"
#include "RoadNetwork.h"
#include "RoadRenderer.h"
#include "BuildingManager.h"
#include "QuadArray.h"

class Game;
class Simulation;

class World
{
public:
	World(Game* game, sf::RenderWindow* window, Simulation* simulation);
	~World();
	void update();
	void queueRenders(DrawQueue& drawQueue);

	RoadNetwork* getRoadNetwork() { return roadNetwork; }
	RoadRenderer* getRoadRenderer() { return roadRenderer; }

	static const float ROAD_HWIDTH;
	static const float PATH_HWIDTH;
	static const float NODE_CURVE_SIZE;
	static const float QUAD_GAP;
	static const float QUAD_SIZE;
	static const sf::Color GRASS_COL;

private:
	Game* game;
	sf::RenderWindow* window;
	Simulation* simulation;

	RoadNetwork* roadNetwork;
	RoadRenderer* roadRenderer;
	BuildingManager* buildingManager;
	QuadArray quads;
};
