
#pragma once
#include "Animation.h"


class Animator {

private:
	sf::Vector2f pos;
	sf::Vector2f scale;
	bool flipped;
	std::map<std::string, bool> booleans;
	std::map<std::string, Animation> animations;
	std::map<std::string, std::vector<Transition>> transitions;
	sf::Sprite sprite;
	sf::Texture texture;

	bool animationSet;
	bool animationPlaying;
	Animation* currentAnimation;
	int currentFrame;
	float currentTime;

	void loadSheet(std::string path, std::string name);


public:
	Animator(std::string);

	void update(float dt);
	void render(sf::RenderWindow& window);

	void animationFinished();

	void triggerAnimation(std::string name);
	void setPosition(sf::Vector2f pos);
	void setScale(sf::Vector2f scale);
	void setFlipped(bool flipped);
	void setBool(std::string name, bool val);
};