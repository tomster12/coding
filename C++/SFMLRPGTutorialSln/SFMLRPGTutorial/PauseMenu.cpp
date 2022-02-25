

#include "stdafx.h"
#include "PauseMenu.h"


#pragma region Constructors

PauseMenu::PauseMenu(sf::RenderWindow& window, sf::Font& font)
	: font(font) {

	// Run initialization
	initVariables(window);
	initButtons();
}


PauseMenu::~PauseMenu() {
	// Clean up variables
	for (auto& it : this->buttons)
		delete it.second;
}

#pragma endregion


#pragma region Initialization

void PauseMenu::initVariables(sf::RenderWindow& window) {
	// Initialize background
	this->background.setSize(sf::Vector2f(
		static_cast<float>(window.getSize().x),
		static_cast<float>(window.getSize().x) ));
	this->background.setFillColor(sf::Color(20, 20, 20, 100));

	// Initialize container
	this->container.setSize(sf::Vector2f(
		static_cast<float>(window.getSize().x * 0.4f),
		static_cast<float>(window.getSize().y * 0.9f) ));
	this->container.setFillColor(sf::Color(20, 20, 20, 100));
	this->container.setPosition(
		window.getSize().x * 0.3f,
		window.getSize().y * 0.05f
	);

	// Initialize menu text
	this->menuText.setFont(this->font);
	this->menuText.setString("Paused");
	this->menuText.setFillColor(sf::Color(240, 240, 240, 200));
	this->menuText.setCharacterSize(50);
	this->menuText.setPosition(
		this->container.getPosition().x + this->container.getSize().x / 2.0f - this->menuText.getGlobalBounds().width / 2.0f,
		this->container.getPosition().y + 30.0f
	);
}


void PauseMenu::initButtons() {
	// Initialize buttons
}

#pragma endregion


#pragma region Functions

void PauseMenu::update(sf::Vector2f& mousePos) {
	// Update buttons
	for (auto& it : this->buttons)
		it.second->update(mousePos);
}


void PauseMenu::render(sf::RenderTarget& target) {
	// Render background and container
	target.draw(background);
	target.draw(container);

	// Render buttons
	for (auto& it : this->buttons)
		it.second->render(target);

	// Render menu text
	target.draw(this->menuText);
}

#pragma endregion
