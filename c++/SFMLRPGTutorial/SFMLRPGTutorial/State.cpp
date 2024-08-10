
#include "stdafx.h"
#include "State.h"


#pragma region Constructors

State::State(sf::RenderWindow* window, std::stack<State*>* states,
	std::map<std::string, int>* supportedKeys) {

	// Run initialization
	this->initVariables(window, states, supportedKeys);
}


State::~State() {}

#pragma endregion


#pragma region Initialization

void State::initVariables(sf::RenderWindow* window, std::stack<State*>* states,
	std::map<std::string, int>* supportedKeys) {

	// Initialize variables
	this->window = window;
	this->states = states;
	this->stateEnded = false;
	this->statePaused = false;

	this->supportedKeys = supportedKeys;
}

#pragma endregion


#pragma region Accessors

const bool& State::getStateEnded() {
	return this->stateEnded;
}

#pragma endregion


#pragma region Functions

void State::updateMousePositions() {
	// Update mouse position variables
	this->mousePosScreen = sf::Mouse::getPosition();
	this->mousePosWindow = sf::Mouse::getPosition(*this->window);
	this->mousePosView = this->window->mapPixelToCoords(sf::Mouse::getPosition(*this->window));
}


void State::endState() {
	// End the current state
	this->stateEnded = true;
}


void State::pauseState() {
	// Pause the state
	this->statePaused = true;
}


void State::unpauseState() {
	// Unpause the state
	this->statePaused = false;
}

#pragma endregion
