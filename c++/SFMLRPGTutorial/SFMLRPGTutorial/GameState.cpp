
#include "stdafx.h"
#include "GameState.h"


#pragma region Constructors

GameState::GameState(sf::RenderWindow* window, std::stack<State*>* states, std::map<std::string, int>* supportedKeys)
	: State(window, states, supportedKeys) {

	// Run initialization
	this->initAssets();
	this->initVariables();
	this->initKeybindings();
	this->initPlayers();

	// Setup pause menu TODO handle reference window pointer mixup
	this->pauseMenu = new PauseMenu(*window, this->fonts["MAIN"]);
	// this->pauseMenu->addButton("QUIT", 500.0f, 200.0f, "Quit");
}


GameState::~GameState() {
	// Clean up variables
	delete this->player;
	delete this->pauseMenu;
}

#pragma endregion


#pragma region Initialization

void GameState::initAssets() {
	// Load textures and fonts
	this->textures["PLAYER_TEXTURESHEET"].loadFromFile("resources/images/sprites/player/skeleton_texturesheet.png");
	this->fonts["MAIN"].loadFromFile("fonts/Anaphora-Regular-trial.ttf");
}


void GameState::initVariables() {}


void GameState::initKeybindings() {
	// Load keybindings from file
	std::ifstream ifs("config/gameStateKeybindings.ini");
	if (ifs.is_open()) {

		// Read each key and value pair
		std::string name = "";
		std::string key = "";
		while (ifs >> name >> key)
			this->keybindings[name] = this->supportedKeys->at(key);

		// Close file afterwards
	} ifs.close();
}


void GameState::initPlayers() {
	// Initialize the player
	this->player = new Player(100, 100, this->textures["PLAYER_TEXTURESHEET"]);
}

#pragma endregion


#pragma region Functions

void GameState::update(const float& dt) {
	// Run all update functions
	this->updateMousePositions();
	this->updateInputs(dt);

	// Currently unpaused
	if (!this->statePaused) {

		// Update the player
		this->player->update(dt);
	
	// Currently paused
	} else {

		// Update the pause menu
		this->pauseMenu->update(this->mousePosView);
	}
}


void GameState::updateInputs(const float& dt) {
	// Currently unpaused
	if (!this->statePaused) {

		// Player movement wasd
		if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key(this->keybindings.at("MOVE_LEFT"))))
			this->player->move(-1.0f, 0.0f);
		if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key(this->keybindings.at("MOVE_UP"))))
			this->player->move(0.0f, -1.0f);
		if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key(this->keybindings.at("MOVE_RIGHT"))))
			this->player->move(1.0f, 0.0f);
		if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key(this->keybindings.at("MOVE_DOWN"))))
			this->player->move(0.0f, 1.0f);

		// Pause menu escape
		if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key(this->keybindings.at("CLOSE"))))
			this->pauseState();

	// Currently paused
	} else {

		// Unpause menu escape
		if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key(this->keybindings.at("CLOSE"))))
			this->unpauseState();
	}
}


void GameState::render(sf::RenderTarget* target) {
	// Use default window if none provided
	if (!target)
		target = this->window;

	// Render the player
	this->player->render(*target);

	// If paused render the pause menu
	if (this->statePaused)
		this->pauseMenu->render(*target);
}

#pragma endregion