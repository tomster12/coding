
#pragma once


class HitboxComponent {

	private:
		// Private variables
		sf::Sprite& sprite;
		sf::RectangleShape hitbox;
		float offsetX, offsetY;

	private:
		// Private initialization
		void initVariables(
			float offsetX, float offsetY,
			float width, float height);

	public:
		// Public constructors
		HitboxComponent(sf::Sprite& sprite,
			float offsetX, float offsetY,
			float width, float height);
		virtual ~HitboxComponent();

		// Public functions
		void update();
		void render(sf::RenderTarget& target);

		bool checkIntersection(const sf::FloatRect& frect);
};

