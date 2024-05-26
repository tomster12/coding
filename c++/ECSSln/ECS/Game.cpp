#include "stdafx.h"
#include "Game.h"

Game::Game()
{
	this->initWindow();
	this->init();
}

Game::~Game()
{
	delete this->window;
	delete this->scene;
}

void Game::initWindow()
{
	// Initialize variables
	this->window = NULL;
	this->dt = 0.0f;

	// Setup default options
	sf::VideoMode windowMode = sf::VideoMode::getDesktopMode();
	windowMode.width = 1280;
	windowMode.height = 720;
	std::string title = "ECS";
	bool fullscreen = false;
	unsigned framerateLimit = 120;
	bool verticalSyncEnabled = false;

	// Setup window using default settings
	if (fullscreen) this->window = new sf::RenderWindow(windowMode, title, sf::Style::Fullscreen);
	else this->window = new sf::RenderWindow(windowMode, title, sf::Style::Titlebar | sf::Style::Close);
	this->window->setFramerateLimit(framerateLimit);
	this->window->setVerticalSyncEnabled(verticalSyncEnabled);

	// Load post processing variables
	//sf::Vector2u size = this->window->getSize();
	//this->windowTex.create(size.x, size.y);
	//this->windowSprite.setTexture(this->windowTex);
	//postprocess.loadFromFile("postprocess.vert", "postprocess.frag");
	//postprocess.setUniform("texture", sf::Shader::CurrentTexture);
	//postprocess.setUniform("blur_radius", 5);
}

void Game::init()
{
	// Init scene
	this->scene = new ecs::Scene();

	// Fill up entities, leave space for attractors
	for (size_t i = 0; i < 300'000; i++)
	{
		ecs::EntityID entity = this->scene->createEntity();
		ecs::component::Transform* t = this->scene->assign<ecs::component::Transform>(entity);
		ecs::component::Particle* p = this->scene->assign<ecs::component::Particle>(entity);
		ecs::component::DynamicBody* db = this->scene->assign<ecs::component::DynamicBody>(entity);

		// Randomize position
		sf::Vector2u size = this->window->getSize();
		t->pos.x = 0.0f + rand() % size.x;
		t->pos.y = 0.0f + rand() % size.y;

		// Randomize color
		p->vtx.color = sf::Color(static_cast<int>(t->pos.x), static_cast<int>(t->pos.y), 150);
	}

	// Log info
	this->scene->log();
}

void Game::run()
{
	// Run game loop
	while (this->window->isOpen())
	{
		this->update();
		this->render();
	}
}

void Game::update()
{
	// Update delta time using dtClock
	this->dt = this->dtClock.restart().asSeconds();

	// Calculate average FPS
	static std::vector<float> fpsList;
	float fps = 1.0f / this->dt;
	fpsList.emplace_back(fps);
	if (fpsList.size() > 5)
	{
		float av = 0.0f;
		for (size_t i = 0; i < fpsList.size(); i++) av += fpsList[i];
		std::cout << "fps average: " << av / 5.0f << std::endl;
		fpsList.clear();
	}

	// Poll Events
	while (this->window->pollEvent(this->sfEvent))
	{
		switch (this->sfEvent.type)
		{
			// Add new attractor
		case sf::Event::MouseButtonPressed:
			if (this->sfEvent.mouseButton.button == sf::Mouse::Left)
			{
				ecs::EntityID e = this->scene->createEntity();
				ecs::component::Transform* t = this->scene->assign<ecs::component::Transform>(e);
				ecs::component::Attractor* a = this->scene->assign<ecs::component::Attractor>(e);
				t->pos.x = 0.0f + this->sfEvent.mouseButton.x;
				t->pos.y = 0.0f + this->sfEvent.mouseButton.y;
			}
			break;

			// Closed window
		case sf::Event::Closed:
			this->window->close();
			break;
		}
	}

	// Run update systems
	ecs::system::instUpdateGravity(this->scene, this->window, this->dt);
	ecs::system::instUpdateDynamics(this->scene, this->window, this->dt);
}

void Game::render()
{
	// Reset window
	this->window->clear();

	// Run render functions
	ecs::system::instRenderAttractors(this->scene, this->window, this->dt);
	ecs::system::instRenderParticles(this->scene, this->window, this->dt);

	//// Apply post processing to window
	//this->windowTex.update(*this->window);
	//this->window->clear();
	//this->window->draw(this->windowSprite, &this->postprocess);

	// Display window
	this->window->display();
}
