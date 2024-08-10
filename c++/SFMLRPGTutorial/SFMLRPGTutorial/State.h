
#pragma once


class State {

	protected:
		// Protected variables
		sf::RenderWindow* window;
		std::stack<State*>* states;
		std::map<std::string, sf::Texture> textures;
		std::map<std::string, sf::Font> fonts;
		bool stateEnded;
		bool statePaused;
		
		std::map<std::string, int>* supportedKeys;
		std::map<std::string, int> keybindings;

		sf::Vector2i mousePosScreen;
		sf::Vector2i mousePosWindow;
		sf::Vector2f mousePosView;

	protected:
		// Protected functions
		virtual void initVariables(sf::RenderWindow* window, std::stack<State*>* states,
			std::map<std::string, int>* supportedKeys);
		virtual void initKeybindings() = 0;

	public:
		// Public constructors
		State(sf::RenderWindow* window, std::stack<State*>* states,
			std::map<std::string, int>* supportedKeys);
		virtual ~State();

		// Public accessors
		const bool& getStateEnded();

		// Public functions
		virtual void update(const float& dt) = 0;
		virtual void updateMousePositions();
		virtual void updateInputs(const float& dt) = 0;
		virtual void render(sf::RenderTarget* target = NULL) = 0;

		void endState();
		void pauseState();
		void unpauseState();
};