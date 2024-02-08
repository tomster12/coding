#pragma once

class Game;
class Simulation;
class World;

class PlayerController
{
public:
	PlayerController(Game* game, sf::RenderWindow* window, Simulation* simulation, World* world);
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

	sf::CircleShape indicator;
	int lastPlacedNode = 0;
	bool nodePlacementLock = false;

	static const float CAM_POS_VEL;
	static const float CAM_SCROLL_ACC;
	static const float CAM_SCROLL_DRAG;
};
