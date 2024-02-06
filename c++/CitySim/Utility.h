#pragma once

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

class Utility
{
public:
	static std::vector<sf::Vector2f> getCurvePoints(const sf::Vector2f& a, const sf::Vector2f& b, const sf::Vector2f& p, float segmentSize = 0.5f);

	static float getAngle(const sf::Vector2f& a);

	static sf::Vector2f getIntersection(const sf::Vector2f& p1, const sf::Vector2f& r1, const sf::Vector2f& p2, const sf::Vector2f& r2);

	static float getAngleClockwise(const sf::Vector2f& a, const sf::Vector2f b);
};
