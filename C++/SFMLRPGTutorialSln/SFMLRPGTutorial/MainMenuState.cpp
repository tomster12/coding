
#include "stdafx.h"
#include "MainMenuState.h"


#pragma region Constructors

MainMenuState::MainMenuState(sf::RenderWindow* window, std::stack<State*>* states, std::map<std::string, int>* supportedKeys)
	: State(window, states, supportedKeys) {

	// Run initialization
	this->initAssets();
	this->initVariables();
	this->initBackground();
	this->initKeybindings();
	this->initButtons();
}


MainMenuState::~MainMenuState() {
	// Clean up variables
	for (auto& it : this->buttons)
		delete it.second;
}

#pragma endregion


#pragma region Initialization

void MainMenuState::initAssets() {
	// Load textures and fonts
	this->textures["BACKGROUND"].loadFromFile("resources/images/backgrounds/bgMenu.png");
	this->fonts["MAIN"].loadFromFile("fonts/Anaphora-Regular-trial.ttf");
}


void MainMenuState::initVariables() {}


void MainMenuState::initBackground() {
	// Title font: Sitka Small
	// Initialize background
	this->background = sf::RectangleShape();
	this->background.setSize((sf::Vector2f)this->window->getSize());
	this->background.setTexture(&this->textures["BACKGROUND"]);
}


void MainMenuState::initKeybindings() {
	// Load keybindings from file
	std::ifstream ifs("config/mainMenuStateKeybindings.ini");
	if (ifs.is_open()) {

		// Read each key and value pair
		std::string name = "";
		std::string key = "";
		while (ifs >> name >> key)
			this->keybindings[name] = this->supportedKeys->at(key);

	// Close file afterwards
	} ifs.close();
}


void MainMenuState::initButtons() {
	// Initialize all buttons
	this->buttons["GAME_STATE"] = new Button(100.0f, 330.0f, 260.0f, 80.0f,
		&this->fonts["MAIN"], "Start Game", 30,
		sf::Color::White, sf::Color::White, sf::Color::White,
		sf::Color(70, 70, 70, 200), sf::Color(140, 140, 140, 220), sf::Color(30, 30, 30, 255));

	this->buttons["SETTINGS_STATE"] = new Button(100.0f, 480.0f, 260.0f, 80.0f,
		&this->fonts["MAIN"], "Settings", 30,
		sf::Color::White, sf::Color::White, sf::Color::White,
		sf::Color(70, 70, 70, 200), sf::Color(140, 140, 140, 220), sf::Color(30, 30, 30, 255));

	this->buttons["EDITOR_STATE"] = new Button(100.0f, 630.0f, 260.0f, 80.0f,
		&this->fonts["MAIN"], "Editor", 30,
		sf::Color::White, sf::Color::White, sf::Color::White,
		sf::Color(70, 70, 70, 200), sf::Color(140, 140, 140, 220), sf::Color(30, 30, 30, 255));

	this->buttons["EXIT_STATE"] = new Button(100.0f, 780.0f, 260.0f, 80.0f,
		&this->fonts["MAIN"], "Exit", 30,
		sf::Color::White, sf::Color::White, sf::Color::White,
		sf::Color(70, 70, 70, 200), sf::Color(140, 140, 140, 220), sf::Color(30, 30, 30, 255));

	//sf::Color(70, 70, 70, 200), sf::Color(140, 140, 140, 220), sf::Color(30, 30, 30, 255),
	//sf::Color(70, 70, 70, 0), sf::Color(140, 140, 140, 0), sf::Color(30, 30, 30, 0)

	//sf::Color::White, sf::Color::White, sf::Color::White,
	//sf::Color(70, 70, 70, 200), sf::Color(140, 140, 140, 220), sf::Color(30, 30, 30, 255)
}

#pragma endregion


#pragma region Functions

void MainMenuState::update(const float& dt) {
	// Run all update functions
	this->updateMousePositions();
	this->updateInputs(dt);
	this->updateButtons(dt);
}


void MainMenuState::updateInputs(const float& dt) {}


void MainMenuState::updateButtons(const float& dt) {
	// Updates all buttons
	for (auto& it : this->buttons)
		it.second->update(this->mousePosView);

	// Goto game state
	 if (this->buttons["GAME_STATE"]->isPressed())
		this->states->push(new GameState(this->window, this->states, this->supportedKeys));

	 // Goto editor state
	 if (this->buttons["EDITOR_STATE"]->isPressed())
		 this->states->push(new EditorState(this->window, this->states, this->supportedKeys));

	// Exit current state
	 if (this->buttons["EXIT_STATE"]->isPressed())
		 this->endState();
}


void MainMenuState::render(sf::RenderTarget* target) {
	// Use default window if none provided
	if (!target) target = this->window;

	// Render background
	target->draw(this->background);

	// Run all render function
	this->renderButtons(*target);
}


void MainMenuState::renderButtons(sf::RenderTarget& target) {
	// Renders all buttons
	for (auto& it : this->buttons)
		it.second->render(target);
}

#pragma endregion
