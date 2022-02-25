
#pragma once
#include "list"


struct Frame {

public:
	float duration;
	sf::IntRect rect;
	sf::Vector2f origin;
};


struct Transition {

public:
	std::string from;
	std::string to;
	std::map<std::string, bool> requirements;
};


class Animation {

private:
	std::string name;
	std::vector<Frame> frames;


public:
	Animation();
	Animation(std::string name, int frameCount);

	std::string getName();
	void setFrame(int index, float duration, sf::IntRect rect, sf::Vector2f origin);
	Frame* getFrame(int index);
	size_t getFrameCount();
};
