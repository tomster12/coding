
#include "stdafx.h"
#include "Animator.h"
#include "Animation.h"
#include "RSJparser.cpp"


#pragma region Setup

Animator::Animator(std::string path) {
	// Initialize variables
	this->pos = { 0, 0 };
	this->scale = { 1.0f, 1.0f };
	this->flipped = false;
	this->loadSheet("assets", "dudeAnimation");
}


void Animator::loadSheet(std::string path, std::string name) {
	// Load animation sheet and parse JSON
	std::ifstream sheetStream(path + "/" + name + ".animator");
	RSJresource sheetJSON(sheetStream);

	// Loop over all animations
	this->animations.clear();
	RSJobject animations = sheetJSON["animations"].as_object();
	for (auto& it0 : animations) {
		std::string name = it0.first;
		RSJresource animation = it0.second;
		int frameCount = animation["frames"].size();
		this->animations[name] = Animation(name, frameCount);

		// Loop over all animation frames
		int currentFrame = 0;
		RSJarray frames = animation["frames"].as_array();
		for (auto& it1 : frames) {
			RSJobject frame = it1.as<RSJobject>();

			// Get values and then create animation
			float duration = (float)frame["duration"].as<double>();
			RSJobject rectO = frame["rect"].as<RSJobject>();
			sf::IntRect rect = sf::IntRect(
				rectO["x"].as<int>(), rectO["y"].as<int>(),
				rectO["w"].as<int>(), rectO["h"].as<int>());
			RSJobject originO = frame["origin"].as<RSJobject>();
			sf::Vector2f origin = sf::Vector2f(
				(float)originO["x"].as<double>(), (float)originO["y"].as<double>());

			// Set animation frame
			this->animations[name].setFrame(currentFrame++, duration, rect, origin);
		}
	}

	// Play start animation
	std::string start = sheetJSON["start"].as<std::string>();
	this->triggerAnimation(start);

	// Loop over all transitions
	this->transitions.clear();
	RSJarray transitions = sheetJSON["transitions"].as_array();
	for (auto& it0 : transitions) {
		RSJresource transition = it0;
		std::string from = transition["from"].as<std::string>();
		std::string to = transition["to"].as<std::string>();

		// Loop over all requirements
		RSJobject requirementsO = transition["requirements"].as_object();
		std::map<std::string, bool> requirements = std::map<std::string, bool>();
		for (auto& it1 : requirementsO) {
			std::string name = it1.first;
			bool value = it1.second.as<bool>();
			requirements[name] = value;
		}

		// Find / create transitions vector and add transition
		if (this->transitions.find(from) == this->transitions.end())
			this->transitions[from] = std::vector<Transition>();
		Transition newTransition = { from, to, requirements };
		this->transitions[from].push_back(newTransition);
	}

	// Load the sheet image at source
	std::string source = sheetJSON["source"].as<std::string>();
	if (!this->texture.loadFromFile(path + "/" + source)) return;

	// Load texture into sprite
	this->sprite.setTexture(this->texture);
}

#pragma endregion


#pragma region Main

void Animator::update(float dt) {
	// Return early if no animation set
	if (!this->animationSet) return;


	// Check each transition for one which fits
	std::string currentName = this->currentAnimation->getName();
	for (auto& it0 : this->transitions[currentName]) {

		// Check each requirement
		bool fit = true;
		for (auto& it1 : it0.requirements) {
			bool matching = this->booleans[it1.first] == it1.second;
			if (!matching) { fit = false; break; }
		}
		
		// If all requirements matched trigger
		if (fit) this->triggerAnimation(it0.to);
	}


	// Get current frame
	Frame* currentFrame = this->currentAnimation->getFrame(this->currentFrame);

	// Update texture rect
	sf::IntRect rect = currentFrame->rect;
	sf::Vector2f origin = currentFrame->origin;
	this->sprite.setTextureRect(rect);
	this->sprite.setOrigin(origin);


	// As long as animation is playing
	if (this->animationPlaying) {

		// Update timing
		this->currentTime += dt;

		// Has gone into next frame
		if (this->currentTime >= currentFrame->duration) {
			this->currentFrame++;
			this->currentTime = 0;

			// Has gone back round to first frame
			if ((size_t)this->currentFrame >= this->currentAnimation->getFrameCount()) {
				this->animationFinished();
			}
		}
	}
}


void Animator::render(sf::RenderWindow& window) {
	// Show current animation if exists
	if (this->animationSet) {

		// Draw sprite to screen
		window.draw(this->sprite);
	}
}


void Animator::animationFinished() {
	// Go back to start of animation
	this->currentFrame = 0;
	//this->animationPlaying = false;
}


void Animator::triggerAnimation(std::string name) {
	// Check animation exists
	if (!this->animations.count(name)) {
		std::cout << "ERROR: No animation " << name << " exists" << std::endl;
		return;
	}

	// Play animation and update variables
	this->animationSet = true;
	this->animationPlaying = true;
	this->currentAnimation = &this->animations[name];
	this->currentFrame = 0;
	this->currentTime = 0.0f;
}


void Animator::setPosition(sf::Vector2f pos) {
	// Update position
	this->pos.x = pos.x;
	this->pos.y = pos.y;
	this->sprite.setPosition(this->pos);
}


void Animator::setScale(sf::Vector2f scale) {
	// Update scale
	this->scale = scale;
	if (this->flipped)
		this->sprite.setScale(this->scale.x * -1.0f, this->scale.y);
	else this->sprite.setScale(this->scale);
}


void Animator::setFlipped(bool flipped) {
	// Flip sprite
	bool toUpdate = this->flipped != flipped;
	this->flipped = flipped;
	if (toUpdate) this->setScale(this->scale);
}


void Animator::setBool(std::string name, bool val) {
	// Update a boolean to a value
	this->booleans[name] = val;
}

#pragma endregion
