
#include "stdafx.h"
#include "HitboxComponent.h"


#pragma region Constructors

HitboxComponent::HitboxComponent(
	sf::Sprite& sprite,
	float offsetX, float offsetY,
	float width, float height)
	: sprite(sprite) {
	
	// Run initialization
	initVariables(
		offsetX, offsetY,
		width, height);
}


HitboxComponent::~HitboxComponent() {}

#pragma endregion


#pragma region Initialization

void HitboxComponent::initVariables(
	float offsetX, float offsetY,
	float width, float height) {

	// Initialize variables
	this->offsetX = offsetX;
	this->offsetY = offsetY;

	// Set hitbox
	this->hitbox.setPosition(
		this->sprite.getPosition().x + this->offsetX,
		this->sprite.getPosition().y + this->offsetY );
	this->hitbox.setSize(sf::Vector2f(width, height));
	this->hitbox.setFillColor(sf::Color::Transparent);
	this->hitbox.setOutlineThickness(1.0f);
	this->hitbox.setOutlineColor(sf::Color::Green);
}

#pragma endregion


#pragma region Functions

void HitboxComponent::update() {
	// Update position
	this->hitbox.setPosition(
		this->sprite.getPosition().x + this->offsetX,
		this->sprite.getPosition().y + this->offsetY
	);
}


void HitboxComponent::render(sf::RenderTarget& target) {
	// Render to target
	target.draw(this->hitbox);
}


bool HitboxComponent::checkIntersection(const sf::FloatRect& frect) {
	// Returns whether this hitbox intersects a float rect
	return this->hitbox.getGlobalBounds().intersects(frect);
}

#pragma endregion