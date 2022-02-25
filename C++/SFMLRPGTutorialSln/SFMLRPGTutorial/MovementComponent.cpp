
#include "stdafx.h"
#include "MovementComponent.h"


#pragma region Constructors

MovementComponent::MovementComponent(sf::Sprite& sprite,
	float maxVelocity, float acceleration, float deceleration)
	: sprite(sprite) {

	// Run initialization
	initVariables(maxVelocity, acceleration, deceleration);
}


MovementComponent::~MovementComponent() {}

#pragma endregion


#pragma region Initialization

void MovementComponent::initVariables(float maxVelocity, float acceleration, float deceleration) {
	// Initialize variables
	this->maxVelocity = maxVelocity;
	this->acceleration = acceleration;
	this->deceleration = deceleration;
}

#pragma endregion


#pragma region Accessors

const bool MovementComponent::getMovementState(const short unsigned state) const {
	// Return whether current state is true
	switch (state) {

		case IDLE:
			return (this->velocity.x == 0.0f && this->velocity.y == 0.0f);

		case MOVING:
			return (this->velocity.x != 0.0f || this->velocity.y != 0.0f);

		case MOVING_LEFT:
			return (this->velocity.x < 0.0f);

		case MOVING_UP:
			return (this->velocity.y < 0.0f);

		case MOVING_RIGHT:
			return (this->velocity.x > 0.0f);

		case MOVING_DOWN:
			return (this->velocity.y > 0.0f);
	}

	// Incorrect passed state
	return false;
}

const float& MovementComponent::getVelocity() const {
	// Returns current velocity
	float vxSq = (this->velocity.x) * (this->velocity.x);
	float vySq = (this->velocity.y) * (this->velocity.y);
	return sqrt(vxSq + vySq);
}


const float& MovementComponent::getMaxVelocity() const {
	// Returns max velocity
	return this->maxVelocity;
}

#pragma endregion


#pragma region Functions

void MovementComponent::update(const float& dt) {
	// Deceleration
	if (this->velocity.x < 0)
		this->velocity.x = this->velocity.x < -this->deceleration ? this->velocity.x + this->deceleration : 0;
	if (this->velocity.x > 0)
		this->velocity.x = this->velocity.x > this->deceleration ? this->velocity.x - this->deceleration : 0;
	if (this->velocity.y < 0)
		this->velocity.y = this->velocity.y < -this->deceleration ? this->velocity.y + this->deceleration : 0;
	if (this->velocity.y > 0)
		this->velocity.y = this->velocity.y > this->deceleration ? this->velocity.y - this->deceleration : 0;

	// Limit velocity TODO use Velocity / Max Velocity Sq
	float velocity = this->getVelocity();
	float maxVelocity = this->getMaxVelocity();
	if (velocity > maxVelocity) {
		this->velocity.x *= maxVelocity / velocity;
		this->velocity.y *= maxVelocity / velocity;
	}

	// Move with velocity
	this->sprite.move(this->velocity * dt);
}


void MovementComponent::move(const float dirX, const float dirY) {
	// Acceleration
	this->velocity.x += this->acceleration * dirX;
	this->velocity.y += this->acceleration * dirY;
}

#pragma endregion
