#include "stdafx.h"
#include "QuadArray.h"

QuadArray::QuadArray(size_t count, float size)
	: quadsCount(count), quadsSize(size), quadsVA(sf::Triangles, count * 6), quadsPos(count)
{
	/*
	for (size_t i = 0; i < count; ++i)
	{
		float pct1 = (float)i / (count - 1);
		float pct2 = 1.0f - pct1;
		sf::Color col1 = sf::Color((int)(155 + pct1 * 100), (int)(255 - pct1 * 100), 200);
		sf::Color col2 = sf::Color((int)(100 + pct2 * 50), (int)(120 - pct2 * 100), (int)(80 + pct2 * 170));

		quadsVA[i * 6 + 0].color = col1;
		quadsVA[i * 6 + 1].color = col1;
		quadsVA[i * 6 + 2].color = col1;
		quadsVA[i * 6 + 3].color = col2;
		quadsVA[i * 6 + 4].color = col2;
		quadsVA[i * 6 + 5].color = col2;
	}*/
};

void QuadArray::render(sf::RenderWindow* window)
{
	window->draw(quadsVA);
}

const sf::Vector2f& QuadArray::getPosition(int i) const
{
	return quadsPos[i];
}

void QuadArray::setPosition(int i, float x, float y)
{
	quadsPos[i].x = x;
	quadsPos[i].y = y;

	quadsVA[i * 6 + 0].position.x = x;
	quadsVA[i * 6 + 0].position.y = y;
	quadsVA[i * 6 + 1].position.x = x + quadsSize;
	quadsVA[i * 6 + 1].position.y = y;
	quadsVA[i * 6 + 2].position.x = x;
	quadsVA[i * 6 + 2].position.y = y + quadsSize;

	quadsVA[i * 6 + 3].position.x = quadsVA[i * 6 + 2].position.x;
	quadsVA[i * 6 + 3].position.y = quadsVA[i * 6 + 2].position.y;
	quadsVA[i * 6 + 4].position.x = quadsVA[i * 6 + 1].position.x;
	quadsVA[i * 6 + 4].position.y = quadsVA[i * 6 + 1].position.y;
	quadsVA[i * 6 + 5].position.x = x + quadsSize;
	quadsVA[i * 6 + 5].position.y = y + quadsSize;
}
