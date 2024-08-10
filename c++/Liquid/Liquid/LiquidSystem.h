
#pragma once
#include "Utility.h"

// https://lucasschuermann.com/writing/implementing-sph-in-2d#introduction


struct Liquid
{
	const sf::Color color;
	const float mass;
	const float viscosity;
	const float restDensity;
	const float gasConst;
};

class Particle
{
public:
	Particle(const Liquid* liquid, const sf::Vector2f& pos) :
		liquid(liquid),
		pos(pos)
	{}

	const Liquid* liquid;
	sf::Vector2f pos;
	sf::Vector2f vel{ 0.0f,0.0f };
	sf::Vector2f force{ 0.0f,0.0f };
	float density = 0.0f;
	float pressure = 0.0f;
};

class LiquidSystem
{
public:
	static constexpr float KERNEL_SIZE = 16.0f;
	static constexpr float KERNEL_SIZE_SQ = KERNEL_SIZE * KERNEL_SIZE;
	static constexpr float COLLISION_DAMP = -0.5f;
	static constexpr float GROUND_DAMP = 0.995f;
	
	static constexpr float SK_POLY6 = 4.0f / (Utility::PI * Utility::cPow(KERNEL_SIZE, 8));
	static constexpr float SK_SPIKY_GRAD = -10.0f / (Utility::PI * Utility::cPow(KERNEL_SIZE, 5));
	static constexpr float SK_VISC_LAP = 40.0f / (Utility::PI * Utility::cPow(KERNEL_SIZE, 5));

	LiquidSystem();
	void update(const float& dt);
	void render(sf::RenderWindow* window);

	void addLiquid(const Liquid* liquid, const sf::Vector2f& pos);
	void addForce(sf::Vector2f pos, sf::Vector2f force, float range);
	int getParticleCount();

private:
	sf::CircleShape circle;
	std::vector<Particle> particles;
};

const Liquid WATER{ sf::Color::Blue, 2.5f, 20.0f, 30.0f, 100.0f };
const Liquid OIL{ sf::Color::Magenta, 7.0f, 40.0f, 50.0f, 50.0f };
