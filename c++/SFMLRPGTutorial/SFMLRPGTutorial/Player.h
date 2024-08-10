
#pragma once

#include "Entity.h"


class Player : public Entity {

	private:
		// Private variables
		bool isAttacking;
		bool facingRight;

	private:
		// Private initializion
		void initVariables(float x, float y);
		void initComponents(sf::Texture& textureSheet);
		void initAnimations();

	public:
		// Public constructors
		Player(float x, float y, sf::Texture& textureSheet);
		virtual ~Player();

		// Public functions
		void update(const float& dt);
		void updateAttack();
		void updateAnimation(const float& dt);
		void render(sf::RenderTarget& target);

		virtual void move(const float dirX, const float dirY);
};

