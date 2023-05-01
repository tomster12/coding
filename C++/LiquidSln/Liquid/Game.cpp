
#include "stdafx.h"
#include "Game.h"
#include "Particle.h"


Game::Game() {
    this->initVariables();
}

void Game::initVariables() {
    this->window = NULL;
    this->dt = 0.0f;

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
 
    this->entities.push_back(Particle({ 50.0f, 50.0f }, 100.0f, sf::Color::Red));
}

Game::~Game() {
    delete this->window;
}


void Game::run() {
    while (this->window->isOpen()) {
        this->update();
        this->render();
    }
}

void Game::update() {
	this->dt = this->dtClock.restart().asSeconds();

    while (this->window->pollEvent(this->sfEvent)) {
        switch (this->sfEvent.type) {

        case sf::Event::Closed:
            this->window->close();
            break;
        }
    }

    for (auto& e : this->entities) e.update();
}

void Game::render() {
    window->clear();
    for (auto& e : this->entities) e.render(this->window);
    window->display();
}
