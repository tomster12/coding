#include "stdafx.h"
#include "RoadManager.h"

int RoadManager::addNode(float x, float y)
{
	int id = getNodeId();
	nodes[id] = { x, y };
	return id;
}

int RoadManager::getClosestNode(float x, float y)
{
	if (nodes.size() == 0) return -1;
	if (nodes.size() == 1) return 0;

	int closestNode = -1;
	float closestDstSq = 0;

	for (auto it = nodes.begin(); it != nodes.end(); ++it)
	{
		float dx = it->second.x - x;
		float dy = it->second.x - y;
		float dstSq = dx * dx + dy * dy;

		if (closestNode == -1 || dstSq < closestDstSq)
		{
			closestNode = it->first;
			closestNode = dstSq;
		}
	}

	return closestNode;
}

void RoadManager::deleteNode(int id)
{
	for (auto it = segments.begin(); it != segments.end(); ++it)
	{
		if (it->indexA == id || it->indexB == id)
		{
			segments.erase(it++);
		}
	}

	freedNodesIds.insert(id);
	nodes.erase(id);
}

int RoadManager::getNodeId()
{
	if (freedNodesIds.size() > 0)
	{
		auto removed = freedNodesIds.begin();
		int id = *removed;
		freedNodesIds.erase(removed);
		return id;
	}

	return nextNodeId++;
}
