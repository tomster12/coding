#include "stdafx.h"
#include "QuadArray.h"

QuadArray::QuadArray(size_t count, float size)
	: quadsCount(count), quadsSize(size), quadsVtx(sf::Triangles, count * 6), quadsPos(count)
{};

void QuadArray::render(sf::RenderWindow* window)
{
	window->draw(quadsVtx);
}

const sf::Vector2f& QuadArray::getPosition(int i) const
{
	return quadsPos[i];
}

void QuadArray::setPosition(int i, float x, float y)
{
	quadsPos[i].x = x;
	quadsPos[i].y = y;

	quadsVtx[i * 6 + 0].position.x = x;
	quadsVtx[i * 6 + 0].position.y = y;
	quadsVtx[i * 6 + 1].position.x = x + quadsSize;
	quadsVtx[i * 6 + 1].position.y = y;
	quadsVtx[i * 6 + 2].position.x = x;
	quadsVtx[i * 6 + 2].position.y = y + quadsSize;

	quadsVtx[i * 6 + 3].position.x = quadsVtx[i * 6 + 2].position.x;
	quadsVtx[i * 6 + 3].position.y = quadsVtx[i * 6 + 2].position.y;
	quadsVtx[i * 6 + 4].position.x = quadsVtx[i * 6 + 1].position.x;
	quadsVtx[i * 6 + 4].position.y = quadsVtx[i * 6 + 1].position.y;
	quadsVtx[i * 6 + 5].position.x = x + quadsSize;
	quadsVtx[i * 6 + 5].position.y = y + quadsSize;
}
