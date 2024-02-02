
#pragma once
#include "Animator.h"


class Player {

private:
	const float GROUND_LEVEL = 500;
	const float GRAVITY = 6.0f;

	float walkingAcc;
	float walkingSpeed;
	float crouchingAcc;
	float crouchingSpeed;
	float jumpForce;
	float friction;
	float attackTimerMax;
	float attackCooldownMax;
	
	Animator animator;
	sf::Vector2f pos;
	sf::Vector2f vel;
	float attackTimer;
	float attackCooldown;

	bool isInputMoving;
	bool isInputCrouching;
	bool isGrounded;
	bool isJumping;
	bool isAttacking;


public:
	Player();

	void update(float dt);
	void render(sf::RenderWindow& window);
};