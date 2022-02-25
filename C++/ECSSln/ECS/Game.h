
#pragma once
#include "ecs.h"


class Game {

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
	ecs::Scene* scn;

	// Private functions
	void initWindow();
	void initVariables();
	void update();
	void render();
};
