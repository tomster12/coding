#include "stdafx.h"
#include "Utility.h"
#include "math.h"

std::vector<sf::Vector2f> Utility::getCurvePoints(const sf::Vector2f& a, const sf::Vector2f& b, const sf::Vector2f& p, float segmentSize)
{
	std::vector<sf::Vector2f> points;

	sf::Vector2f ra = a - p;
	sf::Vector2f rb = b - p;

	return points;
}

float Utility::getAngle(const sf::Vector2f& a)
{
	float angle = atan2(a.y, a.x);
	return angle < 0 ? (angle + (float)M_PI * 2.0f) : angle;
}

sf::Vector2f Utility::getIntersection(const sf::Vector2f& p1, const sf::Vector2f& r1, const sf::Vector2f& p2, const sf::Vector2f& r2)
{
	float c1 = r1.y * p1.x - r1.x * p1.y;
	float c2 = r2.y * p2.x - r2.x * p2.y;
	float det = r2.y * r1.x - r1.y * r2.x;

	// The lines are parallel
	if (det == 0) return { std::numeric_limits<float>::infinity(), std::numeric_limits<float>::infinity() };

	return {
		(r1.x * c2 - r2.x * c1) / det,
		(r1.y * c2 - r2.y * c1) / det
	};
}

float Utility::getAngleClockwise(const sf::Vector2f& a, const sf::Vector2f b)
{
	float angle = atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
	return angle < 0 ? (angle + (float)M_PI * 2.0f) : angle;
}
