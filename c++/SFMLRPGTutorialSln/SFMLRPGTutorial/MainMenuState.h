
#pragma once

#include "State.h"
#include "GameState.h"
#include "EditorState.h"


class MainMenuState : public State {

	private:
		// Private variables
		sf::Texture backgroundTexture;
		sf::RectangleShape background;

		std::map<std::string, Button*> buttons;

	private:
		// Private functions
		void initAssets();
		void initVariables();
		void initBackground();
		void initKeybindings();
		void initButtons();

	public:
		// Public constructors
		MainMenuState(sf::RenderWindow* window, std::stack<State*>* states, std::map<std::string, int>* supportedKeys);
		virtual ~MainMenuState();

		// Public functions
		void update(const float& dt);
		void updateInputs(const float& dt);
		void updateButtons(const float& dt);
		void render(sf::RenderTarget* target = NULL);
		void renderButtons(sf::RenderTarget& target);
};

