
#include "stdafx.h"
#include "EditorState.h"


#pragma region Constructors

EditorState::EditorState(sf::RenderWindow* window, std::stack<State*>* states, std::map<std::string, int>* supportedKeys)
	: State(window, states, supportedKeys) {

	// Run initialization
	this->initVariables();
	this->initFonts();
	this->initKeybindings();
	this->initButtons();
}


EditorState::~EditorState() {
	// Clean up variables
	for (auto& it : this->buttons)
		delete it.second;
}

#pragma endregion


#pragma region Initialization

void EditorState::initVariables() {}


void EditorState::initFonts() {
	// Load font
	this->font.loadFromFile("fonts/Anaphora-Regular-trial.ttf");
}


void EditorState::initKeybindings() {
	// Load keybindings from file
	std::ifstream ifs("config/editorStateKeybindings.ini");
	if (ifs.is_open()) {

		// Read each key and value pair
		std::string name = "";
		std::string key = "";
		while (ifs >> name >> key)
			this->keybindings[name] = this->supportedKeys->at(key);

		// Close file afterwards
	} ifs.close();
}


void EditorState::initButtons() {}

#pragma endregion


#pragma region Functions

void EditorState::update(const float& dt) {
	// Run all update functions
	this->updateMousePositions();
	this->updateInputs(dt);
	this->updateButtons(dt);
}


void EditorState::updateInputs(const float& dt) {
	// Close on escape
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key(this->keybindings.at("CLOSE"))))
		this->endState();
}


void EditorState::updateButtons(const float& dt) {
	// Updates all buttons
	for (auto& it : this->buttons)
		it.second->update(this->mousePosView);
}


void EditorState::render(sf::RenderTarget* target) {
	// Use default window if none provided
	if (!target) target = this->window;

	// Run all render function
	this->renderButtons(*target);
}


void EditorState::renderButtons(sf::RenderTarget& target) {
	// Renders all buttons
	for (auto& it : this->buttons)
		it.second->render(target);
}

#pragma endregion
