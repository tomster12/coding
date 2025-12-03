#include "stdafx.h"
#include "DrawQueue.h"

void DrawQueue::queue(float zIndex, sf::Drawable* drawable)
{
	draws.push_back({ zIndex, drawable });
}

void DrawQueue::render(sf::RenderWindow* window)
{
	std::sort(draws.begin(), draws.end(), [](const auto& a, const auto& b)
	{
		return a.zIndex < b.zIndex;
	});

	for (auto& d : draws)
	{
		window->draw(*d.drawable);
	}
}

void DrawQueue::clear()
{
	draws.clear();
}
