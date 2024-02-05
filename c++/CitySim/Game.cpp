#include "stdafx.h"
#include "Game.h"

Game::Game()
{
	init();
}

void Game::init()
{
	// Initialize variables
	window = NULL;
	dt = 0.0f;

	// Setup window using default settings
	sf::VideoMode windowMode = sf::VideoMode::getDesktopMode();
	windowMode.width = 800;
	windowMode.height = 800;
	std::string title = "SFML Template";
	bool fullscreen = false;
	unsigned framerateLimit = 120;
	bool verticalSyncEnabled = false;
	if (fullscreen) window = new sf::RenderWindow(windowMode, title, sf::Style::Fullscreen);
	else window = new sf::RenderWindow(windowMode, title, sf::Style::Titlebar | sf::Style::Close);
	window->setFramerateLimit(framerateLimit);
	window->setVerticalSyncEnabled(verticalSyncEnabled);

	sim = Simulation(window);
}

Game::~Game()
{
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
	std::cout << (1 / dt) << std::endl;

	while (window->pollEvent(sfEvent))
	{
		switch (sfEvent.type)
		{
			// Closed window
		case sf::Event::Closed:
			window->close();
			break;
		}
	}

	sim.update();
}

void Game::render()
{
	window->clear();

	sim.render();

	window->display();
}
