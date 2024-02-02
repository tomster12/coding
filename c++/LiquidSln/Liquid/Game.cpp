
#include "stdafx.h"
#include "Game.h"
#include "Window.h"


Game::Game(Window* window) :
	window(window),
	frameCount(0),
	liquidSystem()
{
	const sf::Vector2f WATER_POS = { Window::WINDOW_WIDTH * 0.7f, Window::WINDOW_HEIGHT / 2.0f };
	const sf::Vector2f BLOCK_SIZE = { 30, 30 };
	const float BLOCK_SPACING = LiquidSystem::KERNEL_SIZE * 1.2f;

	for (float x = 0; x < BLOCK_SIZE.x; x++)
	{
		for (float y = 0; y < BLOCK_SIZE.y; y++)
		{
			sf::Vector2f jitter = sf::Vector2f{ Utility::random(-1.0f, 1.0f), Utility::random(-1.0f, 1.0f) };
			liquidSystem.addLiquid(&WATER, WATER_POS + (BLOCK_SIZE * -0.5f + sf::Vector2f{ x, y }) * BLOCK_SPACING + jitter);
		}
	}
}


void Game::update(const float& dt)
{
	// Apply force on drag
	prevMousePos = mousePos;
	mousePos = sf::Mouse::getPosition(*window->getWindow());
	if (sf::Mouse::isButtonPressed(sf::Mouse::Left))
	{
		sf::Vector2f diff = sf::Vector2f{ mousePos - prevMousePos };
		float dst = Utility::getLength(diff);
		if (dst > 0.0f)
		{
			sf::Vector2f dir = (diff / dst);
			liquidSystem.addForce(sf::Vector2f(mousePos), 200.0f * dir, 30.0f);
		}
	}

	// Spawn liquid
	if (frameCount % 15 == 0)
	{
		sf::Vector2f jitter = sf::Vector2f{ Utility::random(-1.0f, 1.0f), Utility::random(-1.0f, 1.0f) };
		liquidSystem.addLiquid(&WATER, sf::Vector2f{ Window::WINDOW_WIDTH * 0.25f, Window::WINDOW_HEIGHT * 0.5f } + jitter);
	}

	liquidSystem.update(dt);
	++frameCount;
}

void Game::render()
{
	liquidSystem.render(window->getWindow());
}
