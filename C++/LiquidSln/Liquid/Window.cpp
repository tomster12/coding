
#include "stdafx.h"
#include "Window.h"
#include "Particle.h"


Window::Window() :
    window(NULL),
    sfEvent(),
    dtClock(),
    dt(0.0f)
{
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

    this->game = Game();
}

Window::~Window() {
    delete this->window;
}


void Window::run() {
    while (this->window->isOpen()) {
        this->update();
        this->render();
    }
}

void Window::update() {
	this->dt = this->dtClock.restart().asSeconds();

    while (this->window->pollEvent(this->sfEvent)) {
        switch (this->sfEvent.type) {

        case sf::Event::Closed:
            this->window->close();
            break;
        }
    }

    this->game.update();
}

void Window::render() {
    window->clear();
    this->game.render(this->window);
    window->display();
}
