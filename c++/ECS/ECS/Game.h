#pragma once
#include "ecs.h"
#include "ecsImpl.h"

class Game
{
public:
	Game();
	~Game();

	void run();

private:
	sf::RenderWindow* window;
	sf::Event sfEvent;
	sf::Clock dtClock;
	float dt = 0.0f;

	sf::Texture windowTex;
	sf::Sprite windowSprite;
	sf::Shader postprocess;
	ecs::Scene* scene;

	void initWindow();
	void init();
	void update();
	void render();
};
