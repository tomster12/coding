
#include "stdafx.h"
#include "Entity.h"


#pragma region Constructors

Entity::Entity() {
	// Run initialization
	this->initVariables();
}


Entity::~Entity() {
	// Clean up variables
	delete this->movementComponent;
	delete this->animationComponent;
	delete this->hitboxComponent;
}

#pragma endregion


#pragma region Initializion

void Entity::initVariables() {
	// Initialize variables
	this->movementComponent = NULL;
	this->animationComponent = NULL;
	this->hitboxComponent = NULL;
}

#pragma endregion


#pragma region Functions

void Entity::render(sf::RenderTarget& target) {
	// Render the sprite
	target.draw(this->sprite);
}


void Entity::setPosition(const float x, const float y) {
	// Set the position of the sprite
	this->sprite.setPosition(x, y);
}

#pragma endregion


#pragma region Component functions

void Entity::setTexture(sf::Texture& texture) {
	// Create a sprite using texture
	this->sprite.setTexture(texture);
}


void Entity::createMovementComponent(const float maxVelocity, const float acceleration, const float deceleration) {
	// Create a new movement component
	this->movementComponent = new MovementComponent(this->sprite, maxVelocity, acceleration, deceleration);
}


void Entity::createAnimationComponent(sf::Texture& textureSheet) {
	// Create a new animation component
	this->animationComponent = new AnimationComponent(this->sprite, textureSheet);
}


void Entity::createHitboxComponent(
	sf::Sprite& sprite,
	float offsetX, float offsetY,
	float width, float height) {

	// Create a new hitbox component
	this->hitboxComponent = new HitboxComponent(
		sprite,
		offsetX, offsetY,
		width, height);
}

#pragma endregion