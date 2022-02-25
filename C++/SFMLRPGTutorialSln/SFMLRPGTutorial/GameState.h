
#pragma once

#include "State.h"
#include "Player.h"
#include "PauseMenu.h"


class GameState : public State {

	private:
		// Private variables
		PauseMenu* pauseMenu;
		Player* player;

	private:
		// Private initialization
		void initAssets();
		void initVariables();
		void initKeybindings();
		void initPlayers();

	public:
		// Public constructors
		GameState(sf::RenderWindow* window, std::stack<State*>* states, std::map<std::string, int>* supportedKeys);
		virtual ~GameState();

		// Public functions
		void update(const float& dt);
		void updateInputs(const float& dt);
		void render(sf::RenderTarget* target = NULL);
};

