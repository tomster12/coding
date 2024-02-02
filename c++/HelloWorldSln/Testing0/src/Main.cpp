
#include <iostream>
#include "Common.h"

int main() {
	char var0 = 'A'; // 1 bytes
	short var1 = 2; // 2 bytes
	int var2 = 54; // 4 bytes
	long var3 = 17; // 4 bytes
	long long var4 = 32; // 8 bytes
	float var5 = 4.7f; // 4 bytes
	double var6 = 13.6; // 8 bytes
	std::cout << sizeof(var4) << std::endl;

	int i = 0, o = 0;
	for (; i < 5; i++) {
		log("Hello World");
	}
	while (o < 5) {
		log("Goodbye World!");
		o++;
	}

	std::cin.get();
}