
#include <iostream>

template<typename T>
void print(T value) { // Created when called
	std::cout << value << std::endl;
}

template<typename T, int n>
class Array {
private:
	int size = n;
	T array[n];
public:
	int getSize() const { return size; }
};

int main() {
	print<int>(8);
	print(8);
	print("Hello");
	print(4.7f);

	Array<int, 5> array;
	std::cout << array.getSize() << std::endl;

	std::cin.get();
}