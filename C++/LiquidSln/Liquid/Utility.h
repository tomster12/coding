
#pragma once

#include <cstdlib>



namespace Utility
{
	static constexpr float PI = 3.1415926535897933f;
	
	template <typename T>
	static constexpr T cPow(T num, unsigned int pow)
	{
		return (pow >= sizeof(unsigned int) * 8) ? 0 :
			pow == 0 ? 1 : num * cPow(num, pow - 1);
	}

	static float random(const float& lo, const float& hi)
	{
		return lo + static_cast <float> (rand()) / (static_cast <float> (RAND_MAX / (hi - lo)));
	}

	static float getLengthSq(const sf::Vector2f& vec) { return vec.x * vec.x + vec.y * vec.y; }

	static float getLength(const sf::Vector2f& vec) { return sqrt(getLengthSq(vec)); }

	static sf::Vector2f normalize(const sf::Vector2f& vec) { return vec / getLength(vec); }
};
