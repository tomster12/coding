
#include "stdafx.h"
#include "Button.h"


#pragma region Constructors

Button::Button(float x, float y, float width, float height,
	sf::Font* font, std::string text, unsigned int fontSize,
	sf::Color textIdleColor, sf::Color textHoverColor, sf::Color textActiveColor,
	sf::Color idleColor, sf::Color hoverColor, sf::Color activeColor) {

	// Run initialization
	this->initVariables(x, y, width, height,
		font, text, fontSize,
		textIdleColor, textHoverColor, textActiveColor,
		idleColor, hoverColor, activeColor);
}


Button::~Button() {}

#pragma endregion


#pragma region Initalization

void Button::initVariables(float x, float y, float width, float height,
	sf::Font* font, std::string text, unsigned int fontSize,
	sf::Color textIdleColor, sf::Color textHoverColor, sf::Color textActiveColor,
	sf::Color idleColor, sf::Color hoverColor, sf::Color activeColor) {

	// Initialize variables
	this->shape.setPosition(sf::Vector2f(x, y));
	this->shape.setSize(sf::Vector2f(width, height));

	this->font = font;
	this->text.setFont(*this->font);
	this->text.setString(text);
	this->text.setCharacterSize(fontSize * 3);
	this->text.setScale(1.0f / 3.0f, 1.0f / 3.0f);
	this->text.setPosition(
		x + width / 2.0f - this->text.getGlobalBounds().width * 0.5f,
		y + height / 2.0f - this->text.getGlobalBounds().height * 0.8f
	);

	this->textIdleColor = textIdleColor;
	this->textHoverColor = textHoverColor;
	this->textActiveColor = textActiveColor;
	this->idleColor = idleColor;
	this->hoverColor = hoverColor;
	this->activeColor = activeColor;
	this->buttonState = BTN_IDLE;
}

#pragma endregion


#pragma region Accessors

const bool Button::isPressed() const {
	// Returns whether is currently clicked
	return (this->buttonState == BTN_ACTIVE);
}

#pragma endregion


#pragma region Functions

void Button::update(sf::Vector2f mousePos) {

	// No interaction
	this->buttonState = BTN_IDLE;

	// Mouse hovering
	if (this->shape.getGlobalBounds().contains(mousePos)) {
		this->buttonState = BTN_HOVER;

		// Button pressed
		if (sf::Mouse::isButtonPressed(sf::Mouse::Left))
			this->buttonState = BTN_ACTIVE;
	}

	// Change color based on state
	switch (this->buttonState) {

		case BTN_IDLE:
			this->shape.setFillColor(this->idleColor);
			this->text.setFillColor(this->textIdleColor);
			break;

		case BTN_HOVER:
			this->shape.setFillColor(this->hoverColor);
			this->text.setFillColor(this->textHoverColor);
			break;

		case BTN_ACTIVE:
			this->shape.setFillColor(this->activeColor);
			this->text.setFillColor(this->textActiveColor);
			break;

		default:
			this->shape.setFillColor(sf::Color::Red);
			this->text.setFillColor(sf::Color::Blue);
			break;
	}
}


void Button::render(sf::RenderTarget& target) {
	// Render the shape to the target
	target.draw(this->shape);
	target.draw(this->text);
}

#pragma endregion
