
#pragma once


struct Liquid
{
	const sf::Color color;
	const float density;
};

struct Drop
{
	const Liquid* liquid;
	sf::Vector2f pos;
	sf::Vector2f vel{ 0.0f, 0.0f };
};

class LiquidSystem
{
public:
	static constexpr float DROP_RADIUS = 15.0f;
	static constexpr float DROP_REPEL_FORCE = 10.0f;
	static constexpr float DROP_ATTRACT_FORCE = 3.0f;
	static constexpr float DROP_ATTRACT_DIST = 5.0f;
	static constexpr float DROP_DRAG = 0.98f;
	
	LiquidSystem();
	void update(const float& dt);
	void render(sf::RenderWindow* window);
	void addLiquid(const Liquid* liquid, const sf::Vector2f& pos);

private:
	sf::CircleShape circle;
	std::vector<Drop> drops;
};

const Liquid WATER{ sf::Color::Blue, 0.8f };
const Liquid OIL{ sf::Color::Magenta, 1.0f };
