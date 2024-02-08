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
	std::vector<RoadNodeSegmentIntersectionInfo> segmentIntersections;
	std::vector<RoadNodeSegmentEnd> segmentEnds;
	sf::VertexArray va;
};

struct RoadSegmentMeshInfo
{
	sf::Vector2f d;
	float norm = 0;
	sf::Vector2f n;
	sf::Vector2f perp;
	float nodeOffsetA = 0.0f;
	float nodeOffsetB = 0.0f;
	sf::VertexArray va;
};

class RoadRenderer : IRoadNetworkListener
{
public:
	RoadRenderer(RoadNetwork* network);
	void render(sf::RenderWindow* window);
	void updateMesh();

	// Node meshes only exist with segments
	virtual void onAddSegment(int id) override;
	virtual void onRemoveSegment(int id) override;

	static const int MESH_NODE_CURVE_COUNT;
	static const int MESH_NODE_END_COUNT;
	static const sf::Color MESH_ROAD_COL;
	static const sf::Color MESH_PATH_COL;

private:
	RoadNetwork* network;
	std::map<int, RoadNodeMeshInfo> nodeMI;
	std::map<int, RoadSegmentMeshInfo> segmentMI;
	std::set<int> nodesToUpdate;
	std::set<int> segmentsToUpdate;

	void initSegmentMeshInfo(int id);
	void createNodeMesh(int id);
	void createSegmentMesh(int id);
};
