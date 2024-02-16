#include "stdafx.h"
#include "RoadNetwork.h"
#include "Utility.h"

int RoadNetwork::addNode(float x, float y)
{
	int uid = nodeUIDSource.get();

	nodes[uid] = { { x, y }, {} };

	for (IRoadNetworkListener* l : listeners) l->onAddNode(uid);
	return uid;
}

void RoadNetwork::moveNode(int uid, float x, float y)
{
	const sf::Vector2f oldPos = { nodes[uid].pos.x, nodes[uid].pos.y };
	nodes[uid].pos = { x, y };
	const sf::Vector2f newPos = nodes[uid].pos;

	for (IRoadNetworkListener* l : listeners) l->onMoveNode(uid, oldPos, newPos);
}

void RoadNetwork::removeNode(int uid)
{
	for (IRoadNetworkListener* l : listeners) l->onRemoveNode(uid);

	const RoadNetworkNode& node = getNode(uid);

	for (int id : node.segments) removeSegment(id);

	nodes.erase(uid);
	nodeUIDSource.release(uid);
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
	int id = segmentUIDSource.get();

	segments[id] = { nodeA, nodeB };

	nodes[nodeA].segments.insert(id);
	nodes[nodeB].segments.insert(id);

	for (IRoadNetworkListener* l : listeners) l->onAddSegment(id);
	return id;
}

void RoadNetwork::removeSegment(int uid)
{
	for (IRoadNetworkListener* l : listeners) l->onRemoveSegment(uid);

	const RoadNetworkSegment& segment = getSegment(uid);

	nodes[segment.nodeA].segments.erase(uid);
	nodes[segment.nodeB].segments.erase(uid);

	segments.erase(uid);
	segmentUIDSource.release(uid);
}

int RoadNetwork::getClosestSegment(float x, float y)
{
	int closest = -1;
	float closestDistSq = 0;

	for (const auto& pair : segments)
	{
		sf::Vector2f p = Utility::getClosestPointOnLine({ x, y },
			nodes[pair.second.nodeA].pos,
			nodes[pair.second.nodeB].pos);

		float dx = p.x - x;
		float dy = p.y - y;
		float distSq = dx * dx + dy * dy;

		if (closest == -1 || distSq < closestDistSq)
		{
			closest = pair.first;
			closestDistSq = distSq;
		}
	}

	return closest;
}

void RoadNetwork::clear()
{
	nodes.clear();
	segments.clear();
	nodeUIDSource.reset();
	segmentUIDSource.reset();
}
