#pragma once

#include "DrawQueue.h"
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

struct RoadNodeSegmentEndInfo
{
	int id;
	int side;
	float sideFlip;
	float angle;
	sf::Vector2f n;
	sf::Vector2f perp;

	float offset;
	int offsetIst = -1;
	sf::Vector2f vRoadEndLeft;
	sf::Vector2f vRoadEndRight;
	sf::Vector2f vPathEndLeft;
	sf::Vector2f vPathEndRight;
	sf::Vector2f vWedgeRoadLeft;
	sf::Vector2f vWedgePathLeft;
	sf::Vector2f vWedgeRoadRight;
	sf::Vector2f vWedgePathRight;
};

struct RoadSegmentEdgeInfo
{
	int side = 0;
	sf::Vector2f a;
	sf::Vector2f b;
};

struct RoadNodeMesh
{
	std::vector<RoadNodeSegmentIntersectionInfo> _segmentIntersections;
	std::vector<RoadNodeSegmentEndInfo> _segmentEnds;
	std::vector<sf::Vector2f> collider;
	sf::VertexArray colliderVtx;
	sf::VertexArray mainVtx;
};

struct RoadSegmentMesh
{
	sf::Vector2f d;
	float norm = 0;
	sf::Vector2f n;
	sf::Vector2f perp;
	float nodeOffsetA = 0.0f;
	float nodeOffsetB = 0.0f;
	RoadSegmentEdgeInfo edgeLeft, edgeRight;
	sf::VertexArray colliderVtx;
	sf::VertexArray mainVtx;
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
	static const int MESH_NODE_CURVE_COUNT;
	static const int MESH_NODE_END_COUNT;
	static const sf::Color MESH_ROAD_COL;
	static const sf::Color MESH_PATH_COL;
	static const sf::Color MESH_TEMP_COL;

	RoadRenderer(RoadNetwork* network, bool isTemporary = false);

	void queueRenders(DrawQueue& drawQueue, float zIndex = 3.0f);
	void updateMesh();
	virtual void onMoveNode(int id, const sf::Vector2f& oldPos, const sf::Vector2f& newPos) override;
	virtual void onAddSegment(int id) override;
	virtual void onRemoveSegment(int id) override;
	void clear();

	const RoadNodeMesh& getNodeMesh(int id) { return nodeMeshes[id]; }
	const RoadSegmentMesh& getSegmentMesh(int id) { return segmentMeshes[id]; }

	void subscribeListener(IRoadRendererListener* listener) { listeners.push_back(listener); }
	void unsubscribeListener(IRoadRendererListener* listener) { listeners.erase(std::find(listeners.begin(), listeners.end(), listener)); }

private:
	RoadNetwork* network;
	bool isTemporary = false;

	std::map<int, RoadNodeMesh> nodeMeshes;
	std::map<int, RoadSegmentMesh> segmentMeshes;
	std::set<int> nodesToUpdate;
	std::set<int> segmentsToUpdate;

	std::vector <IRoadRendererListener*> listeners;

	void initSegmentMesh(int id);
	void createNodeMesh(int id);
	void createSegmentMesh(int id);
};
