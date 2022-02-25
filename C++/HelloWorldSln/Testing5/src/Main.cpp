
#include <string>
#include <iostream>
#define LOG(x) std::cout << (x) << std::endl


class Entity {
public:
	float x, y;
	Entity(float x_, float y_) {
		x = x_;
		y = y_;
		LOG("Created an entity");
	}
	~Entity() {
		LOG("Destroyed an entity");
	}
	void move(float dx, float dy) {
		x += dx;
		y += dy;
	}
	void printPosition() {
		LOG(x);
		LOG(y);
	}
	virtual std::string getName() {
		return "Entity";
	}
};


class Player : public Entity {
public:
	std::string name;
	Player(float x_, float y_, std::string name_) 
		: Entity(x_, y_) {
		name = name_;
	}
	std::string getName() {
		return name;
	}
};


void printName(Entity* entity) { // If getName was not marked as virtual it would use Entity definition as per pointer type
	std::cout << "Name: " << entity->getName() << std::endl;
}

void handleEntity() { // Created in memory with pointer therefore not destroyed
	Entity* e = new Entity(2, 3);
	e -> printPosition();
	printName(e);
}

void handlePlayer() { // Created on stack therefore destroyed
	Player player(7, 5, "no");
	player.printPosition();
	printName(&player);
}

int main() {
	handleEntity();
	handlePlayer();
	std::cin.get();
}