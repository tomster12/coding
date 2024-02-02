
#include <iostream>
#include <string>

class VarHolder { // Example class for intializer list
public:
	std::string var;
	VarHolder() {
		std::cout << "Created blank var holder!" << std::endl;
	}
	VarHolder(std::string var) {
		std::cout << "Created var holder with '" << var << "'!" << std::endl;
	}
};

class Entity {
public:
	static const int arraySize = 5; // Cannot get size directly therefore explicitly defined
	int array[arraySize]; // Creates on stack but in class so not deleted
	VarHolder varHolder;

	Entity(std::string var) :
		varHolder(VarHolder(var)) { // Initializer list makes object only instantiated once
	}

	std::string name = "Name";
	mutable int nameGetCount = 0; // Mutable allows it to be affected
	const std::string& getName() const {
		nameGetCount++; // Affecting a variable in a constant function
		return name;
	}
};

int* getArray(int size) { // Creates array of size on heap
	int* array = new int[size];
	for (int i = 0; i < size; i++) {
		array[i] = 7;
	}
	return array;
}

int main() {
	int example[5]; // Creates array of 5 ints on stack
	example[0] = 2;
	example[4] = 3;
	int* array = getArray(5);

	const Entity e("Testing"); // Constant object therefore needs constant function
	const std::string& name = e.getName();
	std::cout << name << std::endl;

	// When using a char* always use const as it is by definition
	const char* string1 = "Hello1"; // Create a string as a char pointer
	const char string2[7] = { 'H', 'e', 'l', 'l', 'o', '2', 0 }; // Manually create a string as a char array
	const std::string string3 = "Hello3";
	bool contains = string3.find("lo") != std::string::npos;

	std::cout << string1 << std::endl; // Output for debug
	std::cout << string2 << std::endl;
	std::cout << string3 << std::endl;
	std::cout << string3.size() << std::endl;
	std::cout << contains << std::endl;

	const char* type1 = u8"wow8";
	const wchar_t* type2 = L"wow16o32";
	const char16_t* type3 = u"wow16";
	const char32_t* type4 = U"wow32";
	const char* typeOther = R"(Line0
Line1
Line2
Line3)";

	std::cin.get();
}