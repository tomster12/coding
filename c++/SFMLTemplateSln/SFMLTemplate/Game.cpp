#include "stdafx.h"
#include "Game.h"

Game::Game()
{
	this->initVariables();
}

void Game::initVariables()
{
	// Initialize variables
	this->window = NULL;
	this->dt = 0.0f;

	// Setup window using default settings
	sf::VideoMode windowMode = sf::VideoMode::getDesktopMode();
	windowMode.width = 800;
	windowMode.height = 800;
	std::string title = "SFML Template";
	bool fullscreen = false;
	unsigned framerateLimit = 120;
	bool verticalSyncEnabled = false;
	if (fullscreen) this->window = new sf::RenderWindow(windowMode, title, sf::Style::Fullscreen);
	else this->window = new sf::RenderWindow(windowMode, title, sf::Style::Titlebar | sf::Style::Close);
	this->window->setFramerateLimit(framerateLimit);
	this->window->setVerticalSyncEnabled(verticalSyncEnabled);

	// Init circle
	this->testCircle = sf::CircleShape(100);
	this->testCircle.setFillColor(sf::Color(100, 250, 50));
}

Game::~Game()
{
	delete this->window;
}

void Game::run()
{
	while (this->window->isOpen())
	{
		this->update();
		this->render();
	}
}

void Game::update()
{
	this->dt = this->dtClock.restart().asSeconds();

	while (this->window->pollEvent(this->sfEvent))
	{
		switch (this->sfEvent.type)
		{
			// Closed window
		case sf::Event::Closed:
			this->window->close();
			break;
		}
	}
}

void Game::render()
{
	window->clear();

	// Render circle on mouse
	sf::Vector2i pos = sf::Mouse::getPosition(*this->window);
	this->testCircle.setPosition(pos.x - 100.0f, pos.y - 100.0f);
	window->draw(this->testCircle);

	window->display();
}
