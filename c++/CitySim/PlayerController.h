#pragma once

#include "RoadNetwork.h"
#include "RoadRenderer.h"

class Game;
class Simulation;
class World;

class PlayerController
{
public:
	PlayerController(Game* game, sf::RenderWindow* window, Simulation* simulation, World* world);
	~PlayerController();
	void update();
	void render();

private:
	Game* game;
	sf::RenderWindow* window;
	Simulation* simulation;
	World* world;

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
