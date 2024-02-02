
#include "stdafx.h"
#include "Player.h"
#include "Animator.h"


Player::Player() : animator("test") {
	// Initialize variables
	this->walkingAcc = 25.0f;
	this->crouchingAcc = 15.0f;
	this->walkingSpeed = 150.0f;
	this->crouchingSpeed = 110.0f;
	this->jumpForce = 350.0f;
	this->friction = 0.92f;
	this->attackTimerMax = 0.5f;
	this->attackCooldownMax = 0.5f;

	this->animator.setScale({ 8.0f, 8.0f });
	this->pos = { 400, GROUND_LEVEL };
	this->vel = { 0, 0 };
	this->attackTimer = 0.0f;
	this->attackCooldown = 0.0f;

	this->isInputMoving = false;
	this->isInputCrouching = false;
	this->isGrounded = true;
	this->isJumping = false;
	this->isAttacking = false;
}


void Player::update(float dt) {

	#pragma region Input

	// Attack if grounded on LMB
	if (this->isGrounded && !this->isAttacking && sf::Mouse::isButtonPressed(sf::Mouse::Left) && this->attackCooldown == 0.0f) {
		this->isAttacking = true;
		this->attackTimer = this->attackTimerMax;
	}

	// Jump on SPACE when grounded
	if (this->isGrounded && !this->isAttacking) {
		if (sf::Keyboard::isKeyPressed(sf::Keyboard::Space)) {
			this->isGrounded = false;
			this->isJumping = true;
			this->vel.y -= this->jumpForce;
		}
	}

	// Get horizontal movement direction from A / D and crouch on LCTRL
	float movementDir = 0.0f;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::A)) movementDir = -1.0f;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::D)) movementDir = 1.0f;
	this->isInputMoving = movementDir != 0.0f;
	this->isInputCrouching = sf::Keyboard::isKeyPressed(sf::Keyboard::LControl);

	#pragma endregion


	#pragma region Logic

	// Apply gravity if not grounded
	if (!this->isGrounded) {

		if (this->pos.y > GROUND_LEVEL) {
			this->pos.y = GROUND_LEVEL;
			this->vel.y = 0.0f;
			this->isGrounded = true;
			this->isJumping = false;

		} else this->vel.y += GRAVITY;
	}

	// Accelerate if moving
	bool isMoving = this->isInputMoving && !this->isAttacking;
	if (isMoving) {
		float movementAcc = this->isInputCrouching ? crouchingAcc : this->walkingAcc;
		float movementSpeed = this->isInputCrouching ? crouchingSpeed : this->walkingSpeed;
		float diff = movementDir * movementAcc;
		if (abs(this->vel.x + diff) <= movementSpeed) this->vel.x += diff;

		// Cap to limit
		else this->vel.x = movementSpeed * (this->vel.x >= 0 ? 1.0f : -1.0f);

	// Apply friction if grounded and not moving
	} else if (this->isGrounded) {
		this->vel.x *= this->friction;
	}

	// Update attack timer
	if (this->isAttacking) {
		this->attackTimer -= dt;
		if (this->attackTimer <= 0.0f) {
			this->isAttacking = false;
			this->attackTimer = 0.0f;
			this->attackCooldown = this->attackCooldownMax;
		}

	// Update cooldown timer
	} else {
		if (this->attackCooldown > 0.0f) {
			this->attackCooldown -= dt;
			if (this->attackCooldown < 0.0f) this->attackCooldown = 0.0f;
		}
	}

	#pragma endregion


	#pragma region Update

	// Update position based on velocity
	this->pos.x += this->vel.x * dt;
	this->pos.y += this->vel.y * dt;

	// Update animator
	this->animator.setBool("isInputMoving", this->isInputMoving);
	this->animator.setBool("isInputCrouching", this->isInputCrouching);
	this->animator.setBool("isGrounded", this->isGrounded);
	this->animator.setBool("isJumping", this->isJumping);
	this->animator.setBool("isAttacking", this->isAttacking);
	this->animator.setPosition(this->pos);
	if (!this->isAttacking && movementDir != 0) this->animator.setFlipped(movementDir < 0.0f);
	this->animator.update(dt);

	#pragma endregion
}



void Player::render(sf::RenderWindow& window) {
	// Render animator
	this->animator.render(window);
}
