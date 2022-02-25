
#include "stdafx.h"
#include "Game.h"


#pragma region Constructors

Game::Game() {
    // Run initialization
    this->initVariables();
    this->initWindow();
    this->initKeys();
    this->initStates();
}


Game::~Game() {
    // Delete game window
	delete this->window;

    // Delete state stack
    while (!this->states.empty()) {
        delete this->states.top();
        this->states.pop();
    }
}

#pragma endregion


#pragma region Initialization

void Game::initVariables() {
    // Initialize variables
    this->window = NULL;
    this->fullscreen = false;
    this->dt = 0.0f;
}


void Game::initWindow() {
    // Load config file
    std::ifstream ifs("config/windows.ini");
    this->videoModes = sf::VideoMode::getFullscreenModes();

    // Setup default options
    std::string title = "None";
    sf::VideoMode windowMode = sf::VideoMode::getDesktopMode();
    bool fullscreen = false;
    unsigned framerateLimit = 120;
    bool verticalSyncEnabled = false;
    unsigned antialiasingLevel = 0;

    // Setup settings with config file
    if (ifs.is_open()) {
        std::getline(ifs, title);
        ifs >> windowMode.width >> windowMode.height;
        ifs >> fullscreen;
        ifs >> framerateLimit;
        ifs >> verticalSyncEnabled;
        ifs >> antialiasingLevel;
    } ifs.close();

    // Setup window using default settings
    if (fullscreen) this->window = new sf::RenderWindow(windowMode, title, sf::Style::Fullscreen, windowSettings);
    else this->window = new sf::RenderWindow(windowMode, title, sf::Style::Titlebar | sf::Style::Close, windowSettings);
    this->fullscreen = fullscreen;
    this->window->setFramerateLimit(framerateLimit);
    this->window->setVerticalSyncEnabled(verticalSyncEnabled);
    this->windowSettings.antialiasingLevel = antialiasingLevel;
}


void Game::initKeys() {
    // Load supported keys from file
    std::ifstream ifs("config/supportedKeys.ini");
    if (ifs.is_open()) {

        // Read each key and value pair
        std::string key = "";
        int keyValue = 0;
        while (ifs >> key >> keyValue)
            this->supportedKeys[key] = keyValue;

    // Close file afterwards
    } ifs.close();
}


void Game::initStates() {
    // Add the initial game state
    this->states.push(new MainMenuState(this->window, &this->states, &this->supportedKeys));
}

#pragma endregion


#pragma region Functions

void Game::run() {
    // Run game loop
    while (this->window->isOpen()) {
        this->update();
        this->render();
    }
}


void Game::update() {
    // Run all update functions
    this->updateDt();
    this->updateSFMLEvents();

    // Update states
    if (!this->states.empty()) {
        this->states.top()->update(this->dt);

        // Delete state
        if (this->states.top()->getStateEnded()) {
            delete this->states.top();
            this->states.pop();
        }

    // End application
    } else {
        this->endGame();
        this->window->close();
    }
}


void Game::updateDt() {
    // Update delta time using dtClock
    this->dt = this->dtClock.restart().asSeconds();
}


void Game::updateSFMLEvents() {
    // Poll Events
    while (this->window->pollEvent(this->sfEvent)) {

        // Closed window
        if (this->sfEvent.type == sf::Event::Closed)
            this->window->close();
    }
}


void Game::render() {
    // Reset window background
    window->clear();

    // Render states
    if (!this->states.empty())
        this->states.top()->render(this->window);

    // Display current draw window
    window->display();
}


void Game::endGame() {
    std::cout << "Ending Game" << std::endl;
}

#pragma endregion

