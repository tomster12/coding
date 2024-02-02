
#include "stdafx.h"
#include "AnimationComponent.h"


#pragma region Animation sub-class

#pragma region Constructors

AnimationComponent::Animation::Animation(
	sf::Sprite& sprite, sf::Texture& textureSheet,
	float frameTime, int width, int height,
	sf::Vector2f origin, sf::Vector2f scale,
	int startPosX, int startPosY,
	int frameCountX, int frameCountY)
	: sprite(sprite), textureSheet(textureSheet) {

	// Run initialization
	this->initVariables(
		frameTime, width, height,
		origin, scale,
		startPosX, startPosY,
		frameCountX, frameCountY);

	// Setup sprite
	this->sprite.setTexture(this->textureSheet, true);
	this->sprite.setTextureRect(this->startRect);
}


AnimationComponent::Animation::~Animation() {}

#pragma endregion


#pragma region Accessors

const bool AnimationComponent::Animation::isDone() const {
	// Returns whether animation is done
	return this->done;
}

#pragma endregion


#pragma region Initialization

void AnimationComponent::Animation::initVariables(
	float frameTime, int width, int height,
	sf::Vector2f origin, sf::Vector2f scale,
	int startPosX, int startPosY,
	int frameCountX, int frameCountY) {

	// Initialize variables
	this->frameTime = frameTime;
	this->currentTime = 0.0f;
	this->done = false;
	this->width = width;
	this->height = height;
	this->origin = origin;
	this->scale = scale;

	this->startRect = sf::IntRect(startPosX, startPosY, width, height);
	this->currentRect = this->startRect;
	this->endRect = sf::IntRect(startPosX + frameCountX * width, startPosY + frameCountY * height, width, height);
}

#pragma endregion


#pragma region Functions

void AnimationComponent::Animation::play(const float& dt, const bool flip, const float& modifier) {
	// Update the animation
	this->done = false;
	this->currentTime += dt * modifier;
	if (this->currentTime >= this->frameTime) {
		this->currentTime = 0.0f;

		// Currently animation
		if (this->currentRect != this->endRect) {
			this->currentRect.left += this->width;

		// Reached end of animation
		} else {
			this->currentRect.left = this->startRect.left;
			this->done = true;
		}

		// Update the sprite texture
		this->sprite.setOrigin(this->origin);
		this->sprite.setScale(this->scale.x * (flip ? -1.0f : 1.0f), this->scale.y);
		this->sprite.setTextureRect(this->currentRect);
	}
}


void AnimationComponent::Animation::reset() {
	// Reset the current animation
	this->currentTime = 0.0f;
	this->currentRect = this->startRect;
}

#pragma endregion

#pragma endregion


#pragma region Constructors

AnimationComponent::AnimationComponent(sf::Sprite& sprite, sf::Texture& textureSheet)
	: sprite(sprite), textureSheet(textureSheet) {

	// Run initialization
	this->initVariables();
}


AnimationComponent::~AnimationComponent() {
	// Delete all animations
	for (auto& i : this->animations)
		delete i.second;
}

#pragma endregion


#pragma region Accessors

const bool AnimationComponent::isDone() const {
	// Return whether current animation is done
	if (this->currentAnimation)
		return this->currentAnimation->isDone();
	else return false;
}

#pragma endregion


#pragma region Initialization

void AnimationComponent::initVariables() {
	// Initialize variables
	this->currentAnimation = NULL;
	this->currentAnimationPriority = -1;
}

#pragma endregion


#pragma region Functions

void AnimationComponent::addAnimation(
	const std::string key,
	float frameTime, int width, int height,
	sf::Vector2f origin, sf::Vector2f scale,
	int startPosX, int startPosY,
	int frameCountX, int frameCountY) {

	// Add an animation
	this->animations[key] = new Animation(
		this->sprite, this->textureSheet,
		frameTime, width, height,
		origin, scale,
		startPosX, startPosY,
		frameCountX, frameCountY);
}


bool AnimationComponent::play(const std::string key, const float& dt, const int& priority, const bool flip, const float& modifier) {
	bool played = false;

	// Use the higher priority animation
	if (priority >= this->currentAnimationPriority) {

		// Reset animation if new
		if (this->currentAnimation != this->animations[key])
			this->animations[key]->reset();

		// Update variables
		this->currentAnimation = this->animations[key];
		this->currentAnimationPriority = priority;
		played = true;

		// Play current animation
		this->currentAnimation->play(dt, flip, modifier);
		if (this->currentAnimation->isDone()) this->currentAnimationPriority = -1;
	}

	// Return whether played animation
	return played;
}

#pragma endregion