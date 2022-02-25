
#include "stdafx.h"
#include "Player.h"


#pragma region Constructors

Player::Player(float x, float y, sf::Texture& textureSheet) {
	// Run initialization
	this->initVariables(x, y);
	this->initComponents(textureSheet);
	this->initAnimations();
}


Player::~Player() {}

#pragma endregion


#pragma region Initialization

void Player::initVariables(float x, float y) {
	// Initialize variables
	this->setPosition(x, y);
	this->isAttacking = false;
	this->facingRight = true;
}


void Player::initComponents(sf::Texture& textureSheet) {
	// Initialize components
	this->createMovementComponent(300.0f, 30.0f, 15.0f);
	this->createAnimationComponent(textureSheet);
	this->createHitboxComponent(this->sprite, -30.0f, -75.0f, 60.0f, 75.0f);
}


void Player::initAnimations() {
	// Initialize animations
	this->animationComponent->addAnimation(
		"IDLE_RIGHT", 0.1f, 24, 37,
		sf::Vector2f(6.0f, 37.0f), sf::Vector2f(3.0f, 3.0f),
		0, 0, 10, 0);

	this->animationComponent->addAnimation(
		"WALK_RIGHT", 0.04f, 22, 37,
		sf::Vector2f(6.0f, 37.0f), sf::Vector2f(3.0f, 3.0f),
		0, 37, 12, 0);

	this->animationComponent->addAnimation(
		"ATTACK_RIGHT", 0.07f, 43, 37,
		sf::Vector2f(10.0f, 37.0f), sf::Vector2f(3.0f, 3.0f),
		0, 74, 17, 0);

	// Set default to idle
	this->sprite.setOrigin(sf::Vector2f(6.0f, 37.0f));
	this->sprite.setScale(sf::Vector2f(3.0f, 3.0f));
}

#pragma endregion


#pragma region Functions

void Player::update(const float& dt) {
	// Update components
	this->movementComponent->update(dt);
	this->hitboxComponent->update();

	// Run all update functions
	this->updateAttack();
	this->updateAnimation(dt);

}


void Player::updateAttack() {
	// Attack on lmb
	if (sf::Mouse::isButtonPressed(sf::Mouse::Left)) {
		this->isAttacking = true;
		std::cout << "Started Attacking" << std::endl;
	}
		
}


void Player::updateAnimation(const float& dt) {
	float movementPercent = this->movementComponent->getVelocity() / this->movementComponent->getMaxVelocity();

	// Play attack animations
	if (this->isAttacking) {
		this->animationComponent->play("ATTACK_RIGHT", dt, 1, !facingRight);
		if (this->animationComponent->isDone())
			isAttacking = false;
	}

	// Play idle / walking animations
	if (this->movementComponent->getMovementState(IDLE)) {
		this->animationComponent->play("IDLE_RIGHT", dt, 0, !facingRight);

	} else if (this->movementComponent->getMovementState(MOVING_RIGHT)) {
		if (this->animationComponent->play("WALK_RIGHT", dt, 0, false, movementPercent))
			facingRight = true;

	} else if (this->movementComponent->getMovementState(MOVING_LEFT)) {
		if (this->animationComponent->play("WALK_RIGHT", dt, 0, true, movementPercent))
			facingRight = false;
	
	} else if (this->movementComponent->getMovementState(MOVING)) {
		this->animationComponent->play("WALK_RIGHT", dt, 0, !facingRight);
	}
}


void Player::render(sf::RenderTarget& target) {
	Entity::render(target);

	// Render hitbox
	this->hitboxComponent->render(target);
}


void Player::move(const float dirX, const float dirY) {
	// Move the movementComponent
	this->movementComponent->move(dirX, dirY);
}

#pragma endregion
