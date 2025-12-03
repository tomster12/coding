#pragma once

#include "stdafx.h"
#include "DrawQueue.h"
#include "Application.h"
#include "RoadNetwork.h"
#include "RoadRenderer.h"
#include "BuildingManager.h"
#include "QuadArray.h"

class Application;
class Simulation;

class Simulation
{
public:
	Simulation(Application* app, sf::RenderWindow* window);
	~Simulation();
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
	Application* app;
	sf::RenderWindow* window;
	RoadNetwork* roadNetwork;
	RoadRenderer* roadRenderer;
	BuildingManager* buildingManager;
	QuadArray quads;
};
