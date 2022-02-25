
#include <iostream>
#include <string>
#include <vector>

struct Vertex {
	float x, y, z;
	Vertex(float x, float y, float z)
		: x(x), y(y), z(z) {}
	Vertex(const Vertex& vertex)
		: x(vertex.x), y(vertex.y), z(vertex.z) {
		std::cout << "Copied" << std::endl;
	}
};

std::ostream& operator<< (std::ostream& stream, const Vertex& vertex) {
	stream << vertex.x << ", " << vertex.y << ", " << vertex.z;
	return stream;
}

int main() {
	std::vector<Vertex> vertices; // Essentially an array list
	vertices.reserve(2); // Reserve 2 memory to prevent copy
	vertices.emplace_back(1, 2, 3); // Create in place to prevent copy
	vertices.emplace_back(4, 5, 6);
	vertices.push_back({ 7, 8, 9 }); // Create in stack then copy over (3 copies)

	for (const Vertex& v : vertices) // Loop through and print all
		std::cout << v << std::endl;
	vertices.erase(vertices.begin() + 1); // Remove at index 1 then clear all
	vertices.clear();

	std::cin.get();
}