#pragma once

#include "DrawQueue.h"
#include "RoadNetwork.h"
#include "RoadRenderer.h"

class Application;
class Simulation;
class Simulation;

class Player
{
public:
	Player(Application* app, Simulation* sim);
	~Player();

	void update();
	void queueRenders(DrawQueue& drawQueue);

private:
	Application* app;
	const Simulation* sim;
	const sf::RenderWindow* window;
	RoadNetwork* roadNetwork;
	const RoadRenderer* roadRenderer;

	sf::View camView;
	sf::Vector2f baseViewSize;
	sf::Vector2f camPos;
	float camZoom;
	float camZoomVel;
	bool nodePlacementLock = false;
	RoadNetwork* buildingRoadNetwork;
	RoadRenderer* buildingRoadRenderer;
	int buildingNodeFrom, buildingBNodeFrom, buildingBNodeTo;
	sf::CircleShape indicator;

	static const float CAM_POS_VEL;
	static const float CAM_SCROLL_ACC;
	static const float CAM_SCROLL_DRAG;
};
