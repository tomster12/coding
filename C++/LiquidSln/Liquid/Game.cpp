
#include "stdafx.h"
#include "Game.h"


Game::Game()
{
	circle = sf::CircleShape(50.0f);
}

Game::~Game()
{
}


void Game::update()
{
}

void Game::render(sf::RenderWindow* window)
{
	window->draw(circle);
}
