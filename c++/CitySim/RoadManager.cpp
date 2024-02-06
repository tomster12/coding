#include "stdafx.h"
#include "RoadManager.h"
#include "math.h"
#include "Utility.h"

const float RoadManager::MESH_ROAD_HWIDTH = 10.0f;
const float RoadManager::MESH_PATH_HWIDTH = 10.0f;
const float RoadManager::MESH_NODE_RADIUS = 45.0f;
const sf::Color RoadManager::MESH_ROAD_COL = sf::Color(100, 100, 100);
const sf::Color RoadManager::MESH_PATH_COL = sf::Color(180, 180, 180);

void RoadManager::render(sf::RenderWindow* window)
{
	if (nodesToUpdate.size() > 0) createMeshes();
	for (const auto& mesh : nodeMeshes) window->draw(mesh.second);
	for (const auto& mesh : segmentMeshes) window->draw(mesh.va);
}

int RoadManager::addNode(float x, float y)
{
	int id = getNodeId();
	nodes[id] = { { x, y } };
	nodesToUpdate.insert(id);
	return id;
}

void RoadManager::deleteNode(int id)
{
	for (auto it = segments.begin(); it != segments.end(); ++it)
	{
		if (it->nodeA == id || it->nodeB == id)
		{
			segments.erase(it++);
		}
	}

	freedNodesIds.insert(id);
	nodes.erase(id);
}

int RoadManager::getClosestNode(float x, float y)
{
	if (nodes.size() == 0) return -1;
	if (nodes.size() == 1) return 0;

	int closestNode = -1;
	float closestDstSq = 0;

	for (auto it = nodes.begin(); it != nodes.end(); ++it)
	{
		float dx = it->second.pos.x - x;
		float dy = it->second.pos.x - y;
		float dstSq = dx * dx + dy * dy;

		if (closestNode == -1 || dstSq < closestDstSq)
		{
			closestNode = it->first;
			closestDstSq = dstSq;
		}
	}

	return closestNode;
}

int RoadManager::addSegment(int nodeA, int nodeB)
{
	int index = segments.size();
	segments.push_back({ nodeA, nodeB });
	segmentMeshes.resize(index + 1);
	createSegmentMesh(index);
	nodesToUpdate.insert(nodeA);
	nodesToUpdate.insert(nodeB);
	return index;
}

void RoadManager::createMeshes()
{
	while (nodesToUpdate.size() > 0)
	{
		auto itr = nodesToUpdate.begin();
		createNodeMesh(*itr);
		nodesToUpdate.erase(itr);
	}
}

void RoadManager::createNodeMesh(int id)
{
	const RoadNode& node = getNode(id);

	// Find all segments that go into this node
	std::vector<std::tuple<int, int, float>> segmentEnds;
	for (size_t i = 0; i < segments.size(); ++i)
	{
		// Check which side goes into this node
		int side = (segments[i].nodeA == id) ? 0 : (segments[i].nodeB == id) ? 1 : -1;
		if (side != -1)
		{
			// Insert into vector at correct position
			const RoadSegmentMeshInfo& mi = segmentMeshes[i];
			sf::Vector2f a = mi.n * (side == 0 ? 1.0f : -1.0f);
			float angle = Utility::getAngle(a);
			for (auto itr = segmentEnds.begin();; ++itr)
			{
				if (itr == segmentEnds.end())
				{
					segmentEnds.push_back({ (int)i, side, angle });
					break;
				}
				if (std::get<2>(*itr) > angle)
				{
					segmentEnds.insert(itr, { (int)i, side, angle });
					break;
				}
			}
		}
	}

	// Loop clockwise around relevant segments
	std::vector<sf::Vector2f> vertices;
	for (size_t i = 0; i < segmentEnds.size(); ++i)
	{
		int ni = (i + 1) % segmentEnds.size();
		const RoadSegmentMeshInfo& ami = segmentMeshes[std::get<0>(segmentEnds[i])];
		const RoadSegmentMeshInfo& bmi = segmentMeshes[std::get<0>(segmentEnds[ni])];
		float aflip = std::get<1>(segmentEnds[i]) == 0 ? 1.0f : -1.0f;
		float bflip = std::get<1>(segmentEnds[ni]) == 0 ? 1.0f : -1.0f;

		// Calculate angle from segment i to ni
		sf::Vector2f an = ami.n * aflip;
		sf::Vector2f bn = bmi.n * bflip;
		//float angle = Utility::getAngleClockwise(an, bn);

		// Draw to intersection
		const sf::Vector2f& aEnd = std::get<1>(segmentEnds[i]) == 0 ? ami.endA : ami.endB;
		const sf::Vector2f& bEnd = std::get<1>(segmentEnds[ni]) == 0 ? bmi.endA : bmi.endB;
		const sf::Vector2f& aPerp = ami.perp * aflip;
		const sf::Vector2f& bPerp = bmi.perp * bflip;

		const sf::Vector2f pa = aEnd + aPerp * MESH_ROAD_HWIDTH;
		const sf::Vector2f pb = bEnd - bPerp * MESH_ROAD_HWIDTH;
		const sf::Vector2f pi = Utility::getIntersection(pa, -an, pb, -bn);

		vertices.push_back(pa);
		vertices.push_back(pi);
		vertices.push_back(pi);
		vertices.push_back(pb);
	}

	sf::VertexArray va{ sf::Lines, vertices.size() };
	for (const auto& v : vertices) va.append(v);
	nodeMeshes[id] = va;
}

void RoadManager::createSegmentMesh(int index)
{
	const RoadSegment& segment = getSegment(index);
	const RoadNode& nodeA = getNode(segment.nodeA);
	const RoadNode& nodeB = getNode(segment.nodeB);

	RoadSegmentMeshInfo mi;
	mi.d = nodeB.pos - nodeA.pos;
	mi.norm = sqrt(mi.d.x * mi.d.x + mi.d.y * mi.d.y);
	mi.n = mi.d / mi.norm;
	mi.perp = { -mi.n.y, mi.n.x };
	mi.endA = nodeA.pos + mi.n * MESH_NODE_RADIUS;
	mi.endB = nodeB.pos - mi.n * MESH_NODE_RADIUS;

	mi.va = sf::VertexArray(sf::Triangles);

	const auto addQuad = [&](const sf::Vertex& a, const sf::Vertex& b, const sf::Vertex& c, const sf::Vertex& d)
	{
		mi.va.append(a);
		mi.va.append(b);
		mi.va.append(c);
		mi.va.append(a);
		mi.va.append(c);
		mi.va.append(d);
	};

	addQuad(
		{ mi.endA - mi.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH), MESH_PATH_COL },
		{ mi.endB - mi.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH), MESH_PATH_COL },
		{ mi.endB - mi.perp * MESH_ROAD_HWIDTH, MESH_PATH_COL },
		{ mi.endA - mi.perp * MESH_ROAD_HWIDTH, MESH_PATH_COL }
	);

	addQuad(
		{ mi.endA - mi.perp * MESH_ROAD_HWIDTH, MESH_ROAD_COL },
		{ mi.endB - mi.perp * MESH_ROAD_HWIDTH, MESH_ROAD_COL },
		{ mi.endB + mi.perp * MESH_ROAD_HWIDTH, MESH_ROAD_COL },
		{ mi.endA + mi.perp * MESH_ROAD_HWIDTH, MESH_ROAD_COL }
	);

	addQuad(
		{ mi.endA + mi.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH), MESH_PATH_COL },
		{ mi.endB + mi.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH), MESH_PATH_COL },
		{ mi.endB + mi.perp * MESH_ROAD_HWIDTH, MESH_PATH_COL },
		{ mi.endA + mi.perp * MESH_ROAD_HWIDTH, MESH_PATH_COL }
	);

	segmentMeshes[index] = std::move(mi);
}

int RoadManager::getNodeId()
{
	if (freedNodesIds.size() > 0)
	{
		auto removed = freedNodesIds.begin();
		int id = *removed;
		freedNodesIds.erase(removed);
		return id;
	}

	return nextNodeId++;
}
