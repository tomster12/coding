
#pragma once


class AnimationComponent {

	private:
		// Private animation sub-class
		class Animation {

		private:
			// Private variables
			sf::Sprite& sprite;
			sf::Texture& textureSheet;

			float frameTime;
			float currentTime;
			bool done;
			int width, height;
			sf::Vector2f origin;
			sf::Vector2f scale;

			sf::IntRect startRect;
			sf::IntRect currentRect;
			sf::IntRect endRect;

		private:
			// Private initialization
			void initVariables(
				float frameTime, int width, int height,
				sf::Vector2f origin, sf::Vector2f scale,
				int startPosX, int startPosY,
				int frameCountX, int frameCountY);

		public:
			// Public constructors
			Animation(
				sf::Sprite& sprite, sf::Texture& textureSheet,
				float frameTime, int width, int height,
				sf::Vector2f origin, sf::Vector2f scale,
				int startPosX, int startPosY,
				int frameCountX, int frameCountY);
			~Animation();

			// Public accessors
			const bool isDone() const;

			// Functions
			void play(const float& dt, const bool flip, const float& modifier);
			void reset();
		};

	private:
		// Private variables
		sf::Sprite& sprite;
		sf::Texture& textureSheet;
		std::map <std::string, Animation*> animations;
		Animation* currentAnimation;
		int currentAnimationPriority;

	private:
		// Private initialization
		void initVariables();

	public:
		// Public constructors
		AnimationComponent(sf::Sprite& sprite, sf::Texture& textureSheet);
		virtual ~AnimationComponent();

		// Public accessors
		const bool isDone() const;

		// Public functions
		void addAnimation(
			const std::string key,
			float frameTime, int width, int height,
			sf::Vector2f origin, sf::Vector2f scale,
			int startPosX, int startPosY,
			int frameCountX, int frameCountY);
		bool play(const std::string key, const float& dt, const int& priority, const bool flip, const float& modifer = 1.0f);
};

