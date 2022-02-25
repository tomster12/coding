
#include <iostream>
#define LOG(x) std::cout << (x) << std::endl // Replaces LOG(x) in code with <-

void increment(int& value) { // Take in a reference and increment the value (Equally as powerful as pointer)
	value++;
}

int main() {

	int var = 8; // Allocate an int of memory and set it to 8
	int* ptr = &var; // Get a pointer to that variable
	*ptr = 2; // Set the value of ptr to 2 hence setting var to 2

	char* buffer = new char[8]; // Allocate 8 chars of memory and save pointer to it in buffer
	memset(buffer, 0, 8); // Set 8 bytes of memory at buffer to 0
	char** ptr1 = &buffer; // Address of the buffer pointer
	delete[] buffer; // Delete the memory afterwards

	int a = 5;
	increment(a); // Pass in a, which is viewed as a reference by the function
	LOG(a);

	std::cin.get();
}