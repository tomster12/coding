#pragma once
#include "ecs.h"
#include "ecsImpl.h"

class Game
{
public:
	// Public constructors
	Game();
	~Game();

	// Public functions
	void run();

private:
	// Private variables
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt;

	sf::Texture windowTex;
	sf::Sprite windowSprite;
	sf::Shader postprocess;
	ecs::Scene* scene;

	// Private functions
	void initWindow();
	void init();
	void update();
	void render();
};
