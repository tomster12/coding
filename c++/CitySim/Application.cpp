#include "stdafx.h"
#include "Application.h"
#include "Simulation.h"
#include "Player.h"

Application::Application()
{
	srand((size_t)time(NULL));

	// Setup window
	sf::VideoMode windowMode = sf::VideoMode::getDesktopMode();
	windowMode.width = 1920;
	windowMode.height = 1080;

	bool fullscreen = false;
	sf::Uint32 style = fullscreen ? sf::Style::Fullscreen : (sf::Style::Titlebar | sf::Style::Close);

	window = new sf::RenderWindow(windowMode, "City Simulation", style);
	window->setFramerateLimit(120);
	window->setVerticalSyncEnabled(false);

	// Setup simulation
	sim = new Simulation(this, window);
	player = new Player(this, sim);
}

Application::~Application()
{
	delete window;
	delete sim;
	delete player;
}

int Application::run()
{
	while (window->isOpen())
	{
		update();
		queueRenders();
	}

	return 0;
}

void Application::update()
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
	player->update();
}

void Application::queueRenders()
{
	window->clear(clearColor);

	drawQueue.clear();

	sim->queueRenders(drawQueue);
	player->queueRenders(drawQueue);

	drawQueue.render(window);

	window->display();
}
