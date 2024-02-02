
#include "stdafx.h"
#include "Animation.h"


Animation::Animation() {}


Animation::Animation(std::string name, int frameCount) {
	// Setup frames vector
	this->name = name;
	this->frames = std::vector<Frame>(frameCount);
}


std::string Animation::getName() {
	// Return this animations name
	return this->name;
}


void Animation::setFrame(int index, float duration, sf::IntRect rect, sf::Vector2f origin) {
	// Add a new frame with given values
	this->frames[index] = { duration, rect, origin };
}


Frame* Animation::getFrame(int index) {
	// Return frame at index
	return &this->frames[index];
}


size_t Animation::getFrameCount() {
	// Return number of frames
	return this->frames.size();
}