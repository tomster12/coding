
#include <iostream>
#include "GLFW/glfw3.h" // Header file relative to included headers in additional include directories

int main() {
	int a = glfwInit(); // Function from a library that is included in the additional linker dependencies
	std::cin.get();
}