
#pragma once


enum eMovementState { IDLE = 0, MOVING, MOVING_LEFT, MOVING_UP, MOVING_RIGHT, MOVING_DOWN };

class MovementComponent {

	private:
		// Private variables
		sf::Sprite& sprite;

		float maxVelocity;
		float acceleration;
		float deceleration;

		sf::Vector2f velocity;

	private:
		// Private initialization
		void initVariables(float maxVelocity, float acceleration, float deceleration);

	public:
		// Public constructors
		MovementComponent(sf::Sprite& sprite,
			float maxVelocity, float acceleration, float deceleration);
		virtual ~MovementComponent();

		// Public accessors
		const bool getMovementState(const short unsigned state) const;
		const float& getVelocity() const;
		const float& getMaxVelocity() const;

		// Public functions
		void update(const float& dt);
		void move(const float dirX, const float dirY);
};

