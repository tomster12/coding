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

std::vector<sf::Vector2f> Utility::getSplinePoints(const sf::Vector2f& p1, const sf::Vector2f c, const sf::Vector2f& p2, int pointCount)
{
	std::vector<sf::Vector2f> points;
	points.push_back(p1);

	for (int i = 1; i < pointCount; i++)
	{
		float t = (float)i / (float)pointCount;
		points.push_back(
			(float)pow((1 - t), 3) * p1
			+ 3 * t * (float)pow((1 - t), 2) * c
			+ 3 * (float)pow(t, 2) * (1 - t) * c
			+ (float)pow(t, 3) * p2
		);
	}

	points.push_back(p2);
	return points;
}

std::vector<sf::Vector2f> Utility::getArcPoints(const sf::Vector2f& p1, const sf::Vector2f c, const sf::Vector2f& p2, int pointCount)
{
	std::vector<sf::Vector2f> points;
	points.push_back(p1);

	sf::Vector2f rp1 = p1 - c;
	sf::Vector2f rp2 = p2 - c;
	float a1 = getAngle(rp1);
	float a2 = getAngle(rp2);
	float d = sqrt(rp1.x * rp1.x + rp1.y * rp1.y);

	for (int i = 1; i < pointCount; i++)
	{
		float ap = a1 + (a2 - a1) * (float)i / (float)pointCount;
		points.push_back({ c.x + cos(ap) * d, c.y + sin(ap) * d });
	}

	points.push_back(p2);
	return points;
}
