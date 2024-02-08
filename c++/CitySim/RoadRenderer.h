#pragma once

#include "RoadNetwork.h"
struct RoadNodeSegmentIntersectionInfo
{
	int segEndA;
	int segEndB;
	float angle;
	sf::Vector2f vPathIst;
	sf::Vector2f vRoadIst;
	sf::Vector2f vRoadIstMid;
};

struct RoadNodeSegmentEnd
{
	int id;
	int side;
	float sideFlip;
	float angle;
	float offset;
	int offsetIst = -1;
	sf::Vector2f n;
	sf::Vector2f perp;
	sf::Vector2f vRoadEndLeft;
	sf::Vector2f vRoadEndRight;
	sf::Vector2f vWedgeRoadLeft;
	sf::Vector2f vWedgePathLeft;
	sf::Vector2f vWedgeRoadRight;
	sf::Vector2f vWedgePathRight;
};

struct RoadNodeMeshInfo
{
	std::vector<RoadNodeSegmentIntersectionInfo> _segmentIntersections;
	std::vector<RoadNodeSegmentEnd> _segmentEnds;
	sf::VertexArray va;
};

struct RoadSegmentEdge
{
	int side;
	sf::Vector2f a;
	sf::Vector2f b;
};

struct RoadSegmentMeshInfo
{
	sf::Vector2f d;
	float norm = 0;
	sf::Vector2f n;
	sf::Vector2f perp;
	float nodeOffsetA = 0.0f;
	float nodeOffsetB = 0.0f;
	RoadSegmentEdge edgeLeft, edgeRight;
	sf::VertexArray va;
};

class IRoadRendererListener
{
public:
	virtual void onUpdateNodeMesh(int id) {};
	virtual void onUpdateSegmentMesh(int id) {};
	virtual void onRemoveNodeMesh(int id) {};
	virtual void onRemoveSegmentMesh(int id) {};
};

class RoadRenderer : IRoadNetworkListener
{
public:
	RoadRenderer(sf::RenderWindow* window, RoadNetwork* network, bool isTemporary = false);
	void render();
	void updateMesh();
	const RoadNodeMeshInfo& getNodeMI(int id) { return nodeMI[id]; }
	const RoadSegmentMeshInfo& getSegmentMI(int id) { return segmentMI[id]; }
	void clear();

	void subscribeListener(IRoadRendererListener* listener) { listeners.push_back(listener); }
	void unsubscribeListener(IRoadRendererListener* listener) { listeners.erase(std::find(listeners.begin(), listeners.end(), listener)); }

	virtual void onMoveNode(int id, const sf::Vector2f& oldPos, const sf::Vector2f& newPos) override;
	virtual void onAddSegment(int id) override;
	virtual void onRemoveSegment(int id) override;

	static const int MESH_NODE_CURVE_COUNT;
	static const int MESH_NODE_END_COUNT;
	static const sf::Color MESH_ROAD_COL;
	static const sf::Color MESH_PATH_COL;
	static const sf::Color MESH_TEMP_COL;

private:
	sf::RenderWindow* window;
	RoadNetwork* network;
	bool isTemporary = false;

	std::map<int, RoadNodeMeshInfo> nodeMI;
	std::map<int, RoadSegmentMeshInfo> segmentMI;
	std::set<int> nodesToCreate;
	std::set<int> segmentsToCreate;

	std::vector <IRoadRendererListener*> listeners;

	void initSegmentMesh(int id);
	void createNodeMesh(int id);
	void createSegmentMesh(int id);
};
