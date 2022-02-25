
#pragma once


enum eButtonState { BTN_IDLE = 0, BTN_HOVER, BTN_ACTIVE };

class Button {

	private:
		// Private variables
		sf::RectangleShape shape;

		sf::Font* font;
		sf::Text text;

		sf::Color textIdleColor;
		sf::Color textHoverColor;
		sf::Color textActiveColor;
		sf::Color idleColor;
		sf::Color hoverColor;
		sf::Color activeColor;
		short unsigned buttonState;

	private:
		// Private initalization
		void initVariables(float x, float y, float width, float height,
			sf::Font* font, std::string text, unsigned int fontSize,
			sf::Color textIdleColor, sf::Color textHoverColor, sf::Color textActiveColor,
			sf::Color idleColor, sf::Color hoverColor, sf::Color activeColor);

	public:
		// Public constructors
		Button(float x, float y, float width, float height,
			sf::Font* font, std::string text, unsigned int fontSize,
			sf::Color textIdleColor, sf::Color textHoverColor, sf::Color textActiveColor,
			sf::Color idleColor, sf::Color hoverColor, sf::Color activeColor);
		~Button();

		// Public accessors
		const bool isPressed() const;

		// Public functions
		void update(const sf::Vector2f mousePos);
		void render(sf::RenderTarget& target);
};

