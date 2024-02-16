#pragma once

#include "DrawQueue.h"
#include "RoadRenderer.h"

struct BuildableEdge
{
	sf::VertexArray va;
};

class World;

class BuildingManager : IRoadRendererListener
{
public:
	BuildingManager(World* world, RoadRenderer* roadRenderer);
	void queueRenders(DrawQueue& drawQueue);
	//const BuildableEdge& getClosestBuildableEdge(sf::Vector2f p) { return getClosestBuildableEdge(p.x, p.y); }
	//const BuildableEdge& getClosestBuildableEdge(float x, float y);

	virtual void onUpdateSegmentMesh(int uid) override;
	virtual void onRemoveSegmentMesh(int uid) override;

private:
	World* world;
	RoadRenderer* roadRenderer;

	std::map<int, BuildableEdge> buildableEdges;

	void updateBuildableEdge(int segUid, int side);
	void removeBuildableEdge(int segUid, int side);
};
