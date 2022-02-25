
#pragma once

#include "Button.h"


class PauseMenu {

	private:
		// Private variables
		sf::RectangleShape background;
		sf::RectangleShape container;

		sf::Font& font;
		sf::Text menuText;
		std::map<std::string, Button*> buttons;

	private:
		// Private initializion
		void initVariables(sf::RenderWindow& window);
		void initButtons();

	public:
		// Public constructors
		PauseMenu(sf::RenderWindow& window, sf::Font& font);
		virtual ~PauseMenu();

		// Public functions
		void update(sf::Vector2f& mousePos);
		void render(sf::RenderTarget& target);
};

