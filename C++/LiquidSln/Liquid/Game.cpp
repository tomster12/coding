
#include "stdafx.h"
#include "Game.h"


Game::Game()
{
	circle = sf::CircleShape(50.0f);
	liquidSystem = LiquidSystem();
	
	for (auto i = 0; i < 200; i++)
		liquidSystem.addLiquid(&WATER, { 400.0f, 400.0f });
}

Game::~Game()
{
}


void Game::update(const float& dt)
{
	liquidSystem.update(dt);
}

void Game::render(sf::RenderWindow* window)
{
	liquidSystem.render(window);
}
