#pragma once

#include <vector>

class QuadArray
{
public:
	QuadArray() {}
	QuadArray(size_t count, float size);
	void render(sf::RenderWindow* window);

	const sf::Vector2f& getPosition(int i) const;
	void setPosition(int i, float x, float y);
	const size_t getCount() const { return quadsCount; }
	const float getSize() const { return quadsSize; }

private:
	size_t quadsCount = 0;
	float quadsSize = 0;
	sf::VertexArray quadsVA;
	std::vector<sf::Vector2f> quadsPos;
};
