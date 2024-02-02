
#pragma once

#include "State.h"
#include "MainMenuState.h"


class Game {

	private:
		// Private variables
		sf::RenderWindow* window;
		std::vector<sf::VideoMode> videoModes;
		sf::ContextSettings windowSettings;
		bool fullscreen;
		sf::Event sfEvent;

		sf::Clock dtClock;
		float dt;

		std::map<std::string, int> supportedKeys;

		std::stack<State*> states;

	private:
		// Private initializion
		void initVariables();
		void initWindow();
		void initKeys();
		void initStates();

	public:
		// Public constructors
		Game();
		~Game();

		// Public Functions
		void run();
		void update();
		void updateDt();
		void updateSFMLEvents();
		void render();

		void endGame();
};

