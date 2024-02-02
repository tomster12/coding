
#pragma once

#include "MovementComponent.h"
#include "AnimationComponent.h"
#include "HitboxComponent.h"


class Entity {

	protected:
		// Protected variables
		sf::Sprite sprite;

		MovementComponent* movementComponent;
		AnimationComponent* animationComponent;
		HitboxComponent* hitboxComponent;

	private:
		// Private initalization
		virtual void initVariables();

	public:
		// Public constructors
		Entity();
		virtual ~Entity();

		// Public functions
		virtual void update(const float& dt) = 0;
		virtual void render(sf::RenderTarget& target);

		virtual void setPosition(const float x, const float y);

		// Public component functions
		void setTexture(sf::Texture& texture);
		void createMovementComponent(const float maxVelocity, const float acceleration, const float deceleration);
		void createAnimationComponent(sf::Texture& textureSheet);
		void createHitboxComponent(
			sf::Sprite& sprite,
			float offsetX, float offsetY,
			float width, float height);
};

