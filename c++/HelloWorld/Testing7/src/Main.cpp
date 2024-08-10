
#include <iostream>

struct Float2 {
	float x, y;
	Float2(float x_, float y_)
		: x(x_), y(y_) {}

	Float2 operator+ (const Float2& other) const {
		return Float2(x + other.x, y + other.y);
	}
	void operator+= (const Float2& other) {
		x += other.x;
		y += other.y;
	}

	Float2 operator- (const Float2& other) const {
		return Float2(x - other.x, y - other.y);
	}
	void operator-= (const Float2& other) {
		x -= other.x;
		y -= other.y;
	}

	Float2 operator* (const Float2& other) const {
		return Float2(x * other.x, y * other.y);
	}
	void operator*= (const Float2& other) {
		x *= other.x;
		y *= other.y;
	}
	void operator*= (int other) {
		x *= other;
		y *= other;
	}

	Float2 operator/ (const Float2& other) const {
		return Float2(x / other.x, y / other.y);
	}
	void operator/= (const Float2& other) {
		x /= other.x;
		y /= other.y;
	}
	void operator/= (int other) {
		x /= other;
		y /= other;
	}

	friend std::ostream& operator<< (std::ostream& stream, const Float2& self);
};

std::ostream& operator<< (std::ostream& stream, const Float2& self) {
	stream << self.x << ", " << self.y;
	return stream;
}

class Entity {

private:
	const std::string name;
	int age;

public:
	Entity(const std::string& name_)
		: name(name_), age(-1) {}

	Entity(int age_)
		: name("Unknown"), age(age_) {}

	const std::string& getName() const {
		return name;
	}

	int getAge() const {
		return age;
	}
};

void printEntity(const Entity& e) {
	std::cout << "Name: " << e.getName() << std::endl;
	std::cout << "Age: " << e.getAge() << std::endl;
}

int main() {
	Entity a(22); // Standard construction to the stack
	Entity b("Name");
	Entity c = Entity(22);
	Entity d = Entity("Name");
	printEntity(Entity(22));
	printEntity(Entity("Name"));

	Entity e = 22; // Implicit conversion
	Entity f = std::string("Name");
	printEntity(22);
	printEntity(std::string("Name"));

	Float2 a1 = { 1, 2 }; // Operator overloading
	Float2 a2 = { 4, 2 };
	a1 += a2;
	a2 += { 1, 1 };
	a2 *= 2;
	a1 /= 3;
	a1 -= { 2, 2 };
	std::cout << a1 << std::endl;
	std::cout << a2 << std::endl;

	std::cin.get();
}
