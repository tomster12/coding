#pragma once

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
	bool hasNode(int id) { return nodes.find(id) != nodes.end(); }
	int addNode(float x, float y);
	int addNode(const sf::Vector2f& p) { return addNode(p.x, p.y); }
	void moveNode(int id, float x, float y);
	void moveNode(int id, const sf::Vector2f& p) { return moveNode(id, p.x, p.y); }
	void removeNode(int id);
	int getClosestNode(float x, float y);
	int getClosestNode(const sf::Vector2f& p) { return getClosestNode(p.x, p.y); }
	const RoadNetworkNode& getNode(int id) const { return nodes.at(id); }
	const std::map<int, RoadNetworkNode>& getNodes(int id) const { return nodes; }

	bool hasSegment(int id) { return segments.find(id) != segments.end(); }
	int addSegment(int nodeA, int nodeB);
	void removeSegment(int id);
	int getClosestSegment(float x, float y);
	int getClosestSegment(const sf::Vector2f& p) { return getClosestSegment(p.x, p.y); }
	const RoadNetworkSegment& getSegment(int id) const { return segments.at(id); }
	const std::map<int, RoadNetworkSegment>& getSegments(int id) const { return segments; }

	void clear();

	void subscribeListener(IRoadNetworkListener* listener) { listeners.push_back(listener); }
	void unsubscribeListener(IRoadNetworkListener* listener) { listeners.erase(std::find(listeners.begin(), listeners.end(), listener)); }

private:
	std::map<int, RoadNetworkNode> nodes;
	std::map<int, RoadNetworkSegment> segments;
	std::set<int> freedNodeIds;
	std::set<int> freedSegmentIds;
	int nextNodeId = 0;
	int nextSegmentId = 0;

	std::vector <IRoadNetworkListener*> listeners;

	int getNodeId();
	int getSegmentId();
};
