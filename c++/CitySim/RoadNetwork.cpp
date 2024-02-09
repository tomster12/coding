#include "stdafx.h"
#include "RoadNetwork.h"
#include "Utility.h"

int RoadNetwork::addNode(float x, float y)
{
	int id = getNodeId();

	nodes[id] = { { x, y }, {} };

	for (IRoadNetworkListener* l : listeners) l->onAddNode(id);
	return id;
}

void RoadNetwork::moveNode(int id, float x, float y)
{
	const sf::Vector2f oldPos = { nodes[id].pos.x, nodes[id].pos.y };
	nodes[id].pos = { x, y };
	const sf::Vector2f newPos = nodes[id].pos;

	for (IRoadNetworkListener* l : listeners) l->onMoveNode(id, oldPos, newPos);
}

void RoadNetwork::removeNode(int id)
{
	for (IRoadNetworkListener* l : listeners) l->onRemoveNode(id);

	const RoadNetworkNode& node = getNode(id);

	for (int id : node.segments) removeSegment(id);

	nodes.erase(id);
	freedNodeIds.insert(id);
}

int RoadNetwork::getClosestNode(float x, float y)
{
	if (nodes.size() == 0) return -1;
	if (nodes.size() == 1) return 0;

	int closestNode = -1;
	float closestDstSq = 0;

	for (auto it = nodes.begin(); it != nodes.end(); ++it)
	{
		float dx = it->second.pos.x - x;
		float dy = it->second.pos.x - y;
		float dstSq = dx * dx + dy * dy;

		if (closestNode == -1 || dstSq < closestDstSq)
		{
			closestNode = it->first;
			closestDstSq = dstSq;
		}
	}

	return closestNode;
}

int RoadNetwork::addSegment(int nodeA, int nodeB)
{
	int id = getSegmentId();

	segments[id] = { nodeA, nodeB };

	nodes[nodeA].segments.insert(id);
	nodes[nodeB].segments.insert(id);

	for (IRoadNetworkListener* l : listeners) l->onAddSegment(id);
	return id;
}

void RoadNetwork::removeSegment(int id)
{
	for (IRoadNetworkListener* l : listeners) l->onRemoveSegment(id);

	const RoadNetworkSegment& segment = getSegment(id);

	nodes[segment.nodeA].segments.erase(id);
	nodes[segment.nodeB].segments.erase(id);

	segments.erase(id);
	freedSegmentIds.insert(id);
}

int RoadNetwork::getClosestSegment(float x, float y)
{
	int closestId = -1;
	float closestDistSq = 0;

	for (const auto& pair : segments)
	{
		sf::Vector2f p = Utility::getClosestPointOnLine({ x, y },
			nodes[pair.second.nodeA].pos,
			nodes[pair.second.nodeB].pos);

		float dx = p.x - x;
		float dy = p.y - y;
		float distSq = dx * dx + dy * dy;

		if (closestId == -1 || distSq < closestDistSq)
		{
			closestId = pair.first;
			closestDistSq = distSq;
		}
	}

	return closestId;
}

void RoadNetwork::clear()
{
	nodes.clear();
	segments.clear();
	freedNodeIds.clear();
	freedSegmentIds.clear();
	nextNodeId = 0;
	nextSegmentId = 0;
}

int RoadNetwork::getNodeId()
{
	if (freedNodeIds.size() > 0)
	{
		auto removed = freedNodeIds.begin();
		int id = *removed;
		freedNodeIds.erase(removed);
		return id;
	}

	return nextNodeId++;
}

int RoadNetwork::getSegmentId()
{
	if (freedSegmentIds.size() > 0)
	{
		auto removed = freedSegmentIds.begin();
		int id = *removed;
		freedSegmentIds.erase(removed);
		return id;
	}

	return nextSegmentId++;
}
