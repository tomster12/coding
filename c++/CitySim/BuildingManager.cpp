#include "stdafx.h"
#include "BuildingManager.h"
#include "World.h"

BuildingManager::BuildingManager(World* world, RoadRenderer* roadRenderer)
	: world(world), roadRenderer(roadRenderer)
{
	roadRenderer->subscribeListener(this);
}

void BuildingManager::onUpdateNodeMesh(int id)
{}

void BuildingManager::onUpdateSegmentMesh(int id)
{
	const RoadSegmentMeshInfo& segmentMI = roadRenderer->getSegmentMI(id);
	const RoadSegmentEdge& edgeLeft = segmentMI.edgeLeft;
	const RoadSegmentEdge& edgeRight = segmentMI.edgeRight;
}

void BuildingManager::onRemoveNodeMesh(int id)
{}

void BuildingManager::onRemoveSegmentMesh(int id)
{}

//const BuildableEdge& BuildingManager::getClosestBuildableEdge(float x, float y) {}
