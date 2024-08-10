
#include <iostream>
#define LOG(x) std::cout << (x) << std::endl

class Player { // Stores variables and functions
public:
	int x, y;
	int speed;
	void move(int dx, int dy) {
		x += dx * speed;
		y += dy * speed;
	}
};

struct Vec2 { // Class but public by default
	float x, y;
};

int main() {
	Player player;
	player.x = 5;
	player.y = 7;
	player.speed = 2;

	player.move(2, 3);
	LOG(player.x);

	std::cin.get();
}