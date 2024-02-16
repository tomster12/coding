#include "stdafx.h"
#include "Game.h"

Game::Game()
{
	window = NULL;
	dt = 0.0f;

	srand((size_t)time(NULL));

	// Setup window using default settings
	sf::VideoMode windowMode = sf::VideoMode::getDesktopMode();
	windowMode.width = 1920;
	windowMode.height = 1080;
	std::string title = "City Simulation";
	bool fullscreen = false;
	unsigned framerateLimit = 120;
	bool verticalSyncEnabled = false;
	if (fullscreen) window = new sf::RenderWindow(windowMode, title, sf::Style::Fullscreen);
	else window = new sf::RenderWindow(windowMode, title, sf::Style::Titlebar | sf::Style::Close);
	window->setFramerateLimit(framerateLimit);
	window->setVerticalSyncEnabled(verticalSyncEnabled);

	sim = new Simulation(this, window);
}

Game::~Game()
{
	delete sim;
	delete window;
}

void Game::run()
{
	while (window->isOpen())
	{
		update();
		render();
	}
}

void Game::update()
{
	dt = dtClock.restart().asSeconds();

	mousePosPrev = mousePos;
	mousePos = sf::Mouse::getPosition(*window);
	mouseScrollDelta = 0;

	sf::Event sfEvent;
	while (window->pollEvent(sfEvent))
	{
		switch (sfEvent.type)
		{
		case sf::Event::Closed:
			window->close();
			break;

		case sf::Event::MouseWheelScrolled:
			mouseScrollDelta = sfEvent.mouseWheelScroll.delta;
			break;
		}
	}

	sim->update();
}

void Game::render()
{
	window->clear(clearColor);

	DrawQueue drawQueue;
	sim->queueRenders(drawQueue);
	drawQueue.render(window);

	window->display();
}