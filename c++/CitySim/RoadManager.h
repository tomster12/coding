#pragma once

struct RoadNode
{
	float x, y;
};

struct RoadSegment
{
	int indexA, indexB;
};

class RoadManager
{
public:
	int addNode(float x, float y);
	void deleteNode(int id);
	int getClosestNode(float x, float y);
	RoadNode const& getNode(int id) const { return nodes.at(id); }
	RoadSegment const& getSegment(int index) const { return segments[index]; }

private:
	std::map<int, RoadNode> nodes;
	std::vector<RoadSegment> segments;
	std::set<int> freedNodesIds;
	int nextNodeId;

	int getNodeId();
};

class RoadRenderer
{};
