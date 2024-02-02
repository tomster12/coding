
#pragma once

#include "State.h"
#include "Button.h"


class EditorState : public State {

	private:
		// Private variables
		sf::Font font;

		std::map<std::string, Button*> buttons;

	private:
		// Private functions
		void initVariables();
		void initFonts();
		void initKeybindings();
		void initButtons();

	public:
		// Public constructors
		EditorState(sf::RenderWindow* window, std::stack<State*>* states, std::map<std::string, int>* supportedKeys);
		virtual ~EditorState();

		// Public functions
		void update(const float& dt);
		void updateInputs(const float& dt);
		void updateButtons(const float& dt);
		void render(sf::RenderTarget* target = NULL);
		void renderButtons(sf::RenderTarget& target);
};

