#pragma once

#include "RoadRenderer.h"

struct BuildableEdge
{
	int segmentId;
};

class World;

class BuildingManager : IRoadRendererListener
{
public:
	BuildingManager(World* world, RoadRenderer* roadRenderer);
	//const BuildableEdge& getClosestBuildableEdge(sf::Vector2f p) { return getClosestBuildableEdge(p.x, p.y); }
	//const BuildableEdge& getClosestBuildableEdge(float x, float y);

	virtual void onUpdateNodeMesh(int id) override;
	virtual void onUpdateSegmentMesh(int id) override;
	virtual void onRemoveNodeMesh(int id) override;
	virtual void onRemoveSegmentMesh(int id) override;

private:
	World* world;
	RoadRenderer* roadRenderer;
};
