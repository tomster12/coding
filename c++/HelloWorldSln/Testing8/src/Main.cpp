
#include <iostream>

class String {
private:
	char* buffer;
	unsigned int size;

public:
	String(const char* string) {
		size = strlen(string);
		buffer = new char[size + 1];
		memcpy(buffer, string, size);
		buffer[size] = 0;
	}
	String(const String& other)
		: size(other.size) {
		buffer = new char[size+1];
		memcpy(buffer, other.buffer, size+1);
	}
	~String() {
		delete[] buffer;
	}

	friend std::ostream& operator<< (std::ostream& stream, const String& string);
	char& operator[] (unsigned int index) {
		return buffer[index];
	}
};

std::ostream& operator<< (std::ostream& stream, const String& string) {
	stream << string.buffer;
	return stream;
}

int main() {
	String str0 = "testing";
	String str1 = str0;

	str1[2] = 'a';

	std::cout << str0 << std::endl;
	std::cout << str1 << std::endl;
	std::cin.get();
}