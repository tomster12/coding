#pragma once

#include "UIDSource.h"

struct RoadNetworkNode
{
	sf::Vector2f pos;
	std::set<int> segments;
};

struct RoadNetworkSegment
{
	int nodeA, nodeB;
};

class IRoadNetworkListener
{
public:
	virtual void onAddNode(int id) {};
	virtual void onMoveNode(int id, const sf::Vector2f& oldPos, const sf::Vector2f& newPos) {};
	virtual void onRemoveNode(int id) {};
	virtual void onAddSegment(int id) {};
	virtual void onRemoveSegment(int id) {};
};

class RoadNetwork
{
public:
	bool hasNode(int uid) { return nodes.find(uid) != nodes.end(); }
	int addNode(float x, float y);
	int addNode(const sf::Vector2f& p) { return addNode(p.x, p.y); }
	void moveNode(int uid, float x, float y);
	void moveNode(int uid, const sf::Vector2f& p) { return moveNode(uid, p.x, p.y); }
	void removeNode(int uid);
	int getClosestNode(float x, float y);
	int getClosestNode(const sf::Vector2f& p) { return getClosestNode(p.x, p.y); }
	const RoadNetworkNode& getNode(int uid) const { return nodes.at(uid); }
	const std::map<int, RoadNetworkNode>& getNodes(int uid) const { return nodes; }

	bool hasSegment(int uid) { return segments.find(uid) != segments.end(); }
	int addSegment(int nodeA, int nodeB);
	void removeSegment(int id);
	int getClosestSegment(float x, float y);
	int getClosestSegment(const sf::Vector2f& p) { return getClosestSegment(p.x, p.y); }
	const RoadNetworkSegment& getSegment(int uid) const { return segments.at(uid); }
	const std::map<int, RoadNetworkSegment>& getSegments(int uid) const { return segments; }

	void clear();

	void subscribeListener(IRoadNetworkListener* listener) { listeners.push_back(listener); }
	void unsubscribeListener(IRoadNetworkListener* listener) { listeners.erase(std::find(listeners.begin(), listeners.end(), listener)); }

private:
	std::map<int, RoadNetworkNode> nodes;
	std::map<int, RoadNetworkSegment> segments;
	UIDSource nodeUIDSource;
	UIDSource segmentUIDSource;

	std::vector <IRoadNetworkListener*> listeners;
};
