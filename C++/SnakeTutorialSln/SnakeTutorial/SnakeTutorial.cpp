
#include <iostream>
#include <Windows.h>
#include <conio.h>


void setup();
void input();
void logic();
void draw();
void updateTailLength(int);

enum directionE { STOP = 0, LEFT, UP, RIGHT, DOWN };
struct position { int x, y; };

bool gameOver;
const int width = 20;
const int height = 20;
directionE movementDir;
position fruitPosition;
int tailLength;
position* bodyPositions;


int main() {
	setup();
	while (!gameOver) {
		input();
		logic();
		draw();
		Sleep(50);
	}
	return 0;
}


void setup() {
	// Setup variables
	gameOver = false;
	movementDir = STOP;
	fruitPosition = { rand() % width, rand() % height };
	tailLength = 1;
	bodyPositions = new position[1];
	bodyPositions[0] = { width / 2, height / 2};
}



void input() {
	// Detect keyboard inputs
	if (_kbhit()) {
		switch (_getch()) {

			// WASD - Movement Direction
			case 'a':
				movementDir = LEFT;
				break;

			case 'w':
				movementDir = UP;
				break;

			case 'd':
				movementDir = RIGHT;
				break;

			case 's':
				movementDir = DOWN;
				break;

			// X - Game Over
			case 'x':
				gameOver = true;
				break;
		}
	}
}


void logic() {
	// Move tail down
	for (int i = tailLength - 1; i > 0; i--)
		bodyPositions[i] = bodyPositions[i - 1];

	// Move head with direction
	switch (movementDir) {

		case LEFT:
			bodyPositions[0].x--;
			break;

		case UP:
			bodyPositions[0].y--;
			break;

		case RIGHT:
			bodyPositions[0].x++;
			break;

		case DOWN:
			bodyPositions[0].y++;
			break;

	}

	// Edge collision
	if (bodyPositions[0].x < 0
	|| bodyPositions[0].x >= width
	|| bodyPositions[0].y < 0
	|| bodyPositions[0].y >= height)
		gameOver = true;

	// Tail collision
	for (int i = 1; i < tailLength; i++) {
		if (bodyPositions[0].x == bodyPositions[i].x
		&& bodyPositions[0].y == bodyPositions[i].y)
			gameOver = true;
	}

	// Food detection
	if (bodyPositions[0].x == fruitPosition.x
		&& bodyPositions[0].y == fruitPosition.y) {
		fruitPosition = { rand() % width, rand() % height };
		updateTailLength(tailLength + 1);
	}
}


void draw() {
	system("cls");

	// Draw border top
	for (int i = 0; i < width + 2; i++) std::cout << "#";
	std::cout << std::endl;

	// For each square on the board
	for (int i = 0; i < height; i++) {
		for (int j = 0; j < width; j++) {

			// Draw border left
			if (j == 0) std::cout << "#";

			// Show tail
			bool tail = false;
			for (int o = 0; o < tailLength; o++) {
				if (i == bodyPositions[o].y
				&& j == bodyPositions[o].x) {
					if (o == 0) std::cout << "O";
					else std::cout << "o";
					tail = true;
					break;
				}
			}

			// No tail here
			if (!tail) {

				// Fruit
				if (i == fruitPosition.y
				&& j == fruitPosition.x) {
					std::cout << "%";

				// Empty space
				} else std::cout << " ";
			}

			// Draw border right
			if (j == width - 1) std::cout << "#";
		}

		// Next line
		std::cout << std::endl;
	}

	// Draw border top
	for (int i = 0; i < width + 2; i++) std::cout << "#";
	std::cout << std::endl;

	// Draw score
	std::cout << "Length: " << tailLength << std::endl;
}


void updateTailLength(int newLength) {
	// Store old body and create new body
	position* tmp = bodyPositions;
	bodyPositions = new position[newLength];

	// Update new body with old body
	for (int i = 0; i < newLength; i++) {
		if (i < tailLength)
			bodyPositions[i] = tmp[i];
		else bodyPositions[i] = tmp[tailLength - 1];
	}
	tailLength = newLength;
}