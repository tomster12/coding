#include "stdafx.h"
#include "BuildingManager.h"
#include "World.h"

BuildingManager::BuildingManager(World* world, RoadRenderer* roadRenderer)
	: world(world), roadRenderer(roadRenderer)
{
	roadRenderer->subscribeListener(this);
}

void BuildingManager::queueRenders(DrawQueue& drawQueue)
{
	for (auto& edgePair : buildableEdges)
	{
		drawQueue.queue({ 3.0f, &edgePair.second.va });
	}
}

void BuildingManager::onUpdateSegmentMesh(int uid)
{
	updateBuildableEdge(uid, 0);
	updateBuildableEdge(uid, 1);
}

void BuildingManager::onRemoveSegmentMesh(int uid)
{
	removeBuildableEdge(uid, 0);
	removeBuildableEdge(uid, 1);
}

void BuildingManager::updateBuildableEdge(int segUid, int side)
{
	const RoadSegmentMeshInfo& segment = world->getRoadRenderer()->getSegmentMI(segUid);
	const RoadSegmentEdge& edge = side == 0 ? segment.edgeLeft : segment.edgeRight;
	int bedgeUid = segUid * 10 + side;

	sf::Vector2f perp = segment.perp * (side == 0 ? 1.0f : -1.0f);

	sf::VertexArray va{ sf::Lines, 2 };
	va[0] = { edge.a + perp * 4.0f, sf::Color::Blue };
	va[1] = { edge.b + perp * 4.0f, sf::Color::Blue };
	buildableEdges[bedgeUid] = { va };
}

void BuildingManager::removeBuildableEdge(int segUid, int side)
{
	//const RoadSegmentMeshInfo& segment = world->getRoadRenderer()->getSegmentMI(segUid);
	//const RoadSegmentEdge& edge = side == 0 ? segment.edgeLeft : segment.edgeRight;
	//int bedgeUid = segUid * 10 + side;
}
