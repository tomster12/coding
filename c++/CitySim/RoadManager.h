#pragma once

struct RoadNode
{
	sf::Vector2f pos;
};

struct RoadSegment
{
	int nodeA, nodeB;
};

struct RoadSegmentMeshInfo
{
	sf::Vector2f d;
	float norm;
	sf::Vector2f n;
	sf::Vector2f perp;
	sf::Vector2f endA;
	sf::Vector2f endB;
	sf::VertexArray va;
};

struct RoadSegmentEnd
{
	int index, node;
};

class RoadManager
{
public:
	void render(sf::RenderWindow* window);
	int addNode(float x, float y);
	void deleteNode(int id);
	int getClosestNode(float x, float y);
	int addSegment(int nodeA, int nodeB);
	void createMeshes();
	const RoadNode& getNode(int id) const { return nodes.at(id); }
	const std::set<int>& getNodeSegments(int id) const { return nodeSegments.at(id); }
	const RoadSegment& getSegment(int index) const { return segments[index]; }

private:
	std::map<int, RoadNode> nodes;
	std::vector<RoadSegment> segments;
	std::map<int, std::set<int>> nodeSegments;
	std::set<int> freedNodesIds;
	int nextNodeId = 0;
	std::map<int, sf::VertexArray> nodeMeshes;
	std::vector<RoadSegmentMeshInfo> segmentMeshes;
	std::set<int> nodesToUpdate;

	void createNodeMesh(int id);
	void createSegmentMesh(int index);
	int getNodeId();

	static const float MESH_ROAD_HWIDTH;
	static const float MESH_PATH_HWIDTH;
	static const float MESH_NODE_RADIUS;
	static const sf::Color MESH_ROAD_COL;
	static const sf::Color MESH_PATH_COL;
};
