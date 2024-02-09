#include "stdafx.h"
#include "math.h"
#include "Utility.h"

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

sf::Vector2f Utility::getClosestPointOnLine(const sf::Vector2f& p, const sf::Vector2f& a, const sf::Vector2f& b)
{
	float l2 = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
	if (l2 == 0) return b;

	float t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
	t = std::max(0.0f, std::min(1.0f, t));
	return a + t * (b - a);
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

std::vector<sf::Vector2f> Utility::sampleBezier(const sf::Vector2f& p1, const sf::Vector2f p2, const sf::Vector2f& p3, float w1, float w2, float w3, int pointCount)
{
	std::vector<sf::Vector2f> points;
	points.push_back(p1);

	for (int i = 1; i < pointCount; i++)
	{
		float t = (float)i / (float)pointCount;
		float ti = 1 - t;

		sf::Vector2f p = (ti * ti) * w1 * p1
			+ (2 * t * ti) * w2 * p2
			+ (t * t) * w3 * p3;

		p /= (ti * ti) * w1
			+ (2 * t * ti) * w2
			+ (t * t) * w3;

		points.push_back(p);
	}

	points.push_back(p3);
	return points;
}

std::vector<sf::Vector2f> Utility::sampleArc(const sf::Vector2f& p1, const sf::Vector2f c, const sf::Vector2f& p2, int pointCount)
{
	std::vector<sf::Vector2f> points;
	points.push_back(p1);

	sf::Vector2f rp1 = p1 - c;
	sf::Vector2f rp2 = p2 - c;
	float a1 = getAngle(rp1);
	float a2 = getAngle(rp2);
	float d = sqrt(rp1.x * rp1.x + rp1.y * rp1.y);
	if (a2 < a1) a2 += (float)M_PI * 2.0f;

	for (int i = 1; i < pointCount; i++)
	{
		float ap = a1 + (a2 - a1) * (float)i / (float)pointCount;
		points.push_back({ c.x + cos(ap) * d, c.y + sin(ap) * d });
	}

	points.push_back(p2);
	return points;
}
