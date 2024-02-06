#pragma once

#include "functional"

struct RoadNode
{
	sf::Vector2f pos;
	std::set<int> segments;
};

struct RoadSegment
{
	int nodeA, nodeB;
};

struct RoadSegmentEnd
{
	int id, node;
};

class IRoadNetworkListener
{
public:
	virtual void onAddNode(int id) {};
	virtual void onRemoveNode(int id) {};
	virtual void onAddSegment(int id) {};
	virtual void onRemoveSegment(int id) {};
};

class RoadNetwork
{
public:
	int addNode(float x, float y);
	void removeNode(int id);
	int getClosestNode(float x, float y);
	const RoadNode& getNode(int id) const { return nodes.at(id); }
	const std::map<int, RoadNode>& getNodes(int id) const { return nodes; }

	int addSegment(int nodeA, int nodeB);
	void removeSegment(int id);
	const RoadSegment& getSegment(int id) const { return segments.at(id); }
	const std::map<int, RoadSegment>& getSegments(int id) const { return segments; }

	void subscribeListener(IRoadNetworkListener* listener) { listeners.push_back(listener); }
	void unsubscribeListener(IRoadNetworkListener* listener) { listeners.erase(std::find(listeners.begin(), listeners.end(), listener)); }

private:
	std::map<int, RoadNode> nodes;
	std::map<int, RoadSegment> segments;
	std::set<int> freedNodesIds;
	std::set<int> freedSegmentIds;
	int nextNodeId = 0;
	int nextSegmentId = 0;

	std::vector <IRoadNetworkListener*> listeners;

	int getNodeId();
	int getSegmentId();
};
