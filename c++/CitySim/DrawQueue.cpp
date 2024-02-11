#include "stdafx.h"
#include "DrawQueue.h"

void DrawQueue::queue(QueuedDraw draw)
{
	draws.push_back(draw);
}

void DrawQueue::render(sf::RenderWindow* window)
{
	std::sort(draws.begin(), draws.end(), [](const auto& a, const auto& b) { return a.zIndex < b.zIndex; });
	for (auto& d : draws) window->draw(*d.drawable);
}
