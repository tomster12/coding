
#include "stdafx.h"
#include "Window.h"


Window::Window() :
    sfEvent(),
    dtClock(),
    dt(0.0f),
    game(this)
{
    bool fullscreen = false;
    unsigned framerateLimit = 120;
    bool verticalSyncEnabled = false;

    sf::VideoMode windowMode = sf::VideoMode::getDesktopMode();
    windowMode.width = Window::WINDOW_WIDTH;
    windowMode.height = Window::WINDOW_HEIGHT;
    std::string title = Window::WINDOW_TITLE;
    if (fullscreen) window = new sf::RenderWindow(windowMode, title, sf::Style::Fullscreen);
    else window = new sf::RenderWindow(windowMode, title, sf::Style::Titlebar | sf::Style::Close);
    window->setFramerateLimit(framerateLimit);
    window->setVerticalSyncEnabled(verticalSyncEnabled);
}

Window::~Window()
{
    delete this->window;
}

void Window::run() {
    while (this->window->isOpen()) {
        this->update();
        this->render();
    }
}

sf::RenderWindow* Window::getWindow() { return window; }


void Window::update() {
	this->dt = this->dtClock.restart().asSeconds();

    while (this->window->pollEvent(this->sfEvent)) {
        switch (this->sfEvent.type) {

        case sf::Event::Closed:
            this->window->close();
            break;
        }
    }

    this->game.update(dt);
}

void Window::render() {
    window->clear(sf::Color::White);
    this->game.render();
    window->display();
}
