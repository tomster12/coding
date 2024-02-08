#include "stdafx.h"
#include "RoadRenderer.h"
#include "World.h"
#include "Utility.h"

const int RoadRenderer::MESH_NODE_CURVE_COUNT = 10;
const int RoadRenderer::MESH_NODE_END_COUNT = 10;
const sf::Color RoadRenderer::MESH_ROAD_COL = sf::Color(100, 100, 100);
const sf::Color RoadRenderer::MESH_PATH_COL = sf::Color(180, 180, 180);

RoadRenderer::RoadRenderer(RoadNetwork* network) : network(network)
{
	network->subscribeListener(this);
}

void RoadRenderer::render(sf::RenderWindow* window)
{
	updateMesh();
	for (const auto& mesh : segmentMI) window->draw(mesh.second.va);
	for (const auto& mesh : nodeMI) window->draw(mesh.second.va);
}

void RoadRenderer::updateMesh()
{
	while (nodesToUpdate.size() > 0)
	{
		auto itr = nodesToUpdate.begin();
		createNodeMesh(*itr);
		nodesToUpdate.erase(itr);
	}
	while (segmentsToUpdate.size() > 0)
	{
		auto itr = segmentsToUpdate.begin();
		createSegmentMesh(*itr);
		segmentsToUpdate.erase(itr);
	}
}

void RoadRenderer::onAddSegment(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);
	initSegmentMeshInfo(id);
	nodesToUpdate.insert(segment.nodeA);
	nodesToUpdate.insert(segment.nodeB);
	for (int segId : network->getNode(segment.nodeA).segments) segmentsToUpdate.insert(segId);
	for (int segId : network->getNode(segment.nodeB).segments) segmentsToUpdate.insert(segId);
	segmentsToUpdate.insert(id);
}

void RoadRenderer::onRemoveSegment(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);
	nodesToUpdate.insert(segment.nodeA);
	nodesToUpdate.insert(segment.nodeB);
	for (int segId : network->getNode(segment.nodeA).segments) segmentsToUpdate.insert(segId);
	for (int segId : network->getNode(segment.nodeB).segments) segmentsToUpdate.insert(segId);
	segmentsToUpdate.insert(id);
}

void RoadRenderer::initSegmentMeshInfo(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);
	const RoadNetworkNode& nodeA = network->getNode(segment.nodeA);
	const RoadNetworkNode& nodeB = network->getNode(segment.nodeB);

	segmentMI[id] = {};
	RoadSegmentMeshInfo& smi = segmentMI[id];

	smi.d = nodeB.pos - nodeA.pos;
	smi.norm = sqrt(smi.d.x * smi.d.x + smi.d.y * smi.d.y);
	smi.n = smi.d / smi.norm;
	smi.perp = { -smi.n.y, smi.n.x };
}

void RoadRenderer::createNodeMesh(int id)
{
	const RoadNetworkNode& node = network->getNode(id);

	nodeMI[id] = {};
	RoadNodeMeshInfo& nmi = nodeMI[id];
	nmi.va = sf::VertexArray{ sf::Triangles };

	// -- 0 segments

	if (node.segments.size() == 0) return;

	// -- 1 segments

	if (node.segments.size() == 1)
	{
		int segId = *node.segments.begin();
		const RoadNetworkSegment& segment = network->getSegment(segId);
		RoadSegmentMeshInfo& smi = segmentMI[segId];

		int side = segment.nodeA == id ? 0 : 1;
		float sideFlip = side == 0 ? 1.0f : -1.0f;
		const sf::Vector2f n = smi.n * sideFlip;
		const sf::Vector2f perp = smi.perp * sideFlip;

		sf::Vector2f pathEndLeft = node.pos - perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
		sf::Vector2f roadEndLeft = node.pos - perp * (World::ROAD_HWIDTH);
		sf::Vector2f pathEndRight = node.pos + perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
		sf::Vector2f roadEndRight = node.pos + perp * (World::ROAD_HWIDTH);

		// Generate curves
		std::vector<sf::Vector2f> roadCurve = Utility::sampleArc(roadEndRight, node.pos, roadEndLeft, MESH_NODE_END_COUNT);
		std::vector<sf::Vector2f> pathCurve = Utility::sampleArc(pathEndRight, node.pos, pathEndLeft, MESH_NODE_END_COUNT);

		for (int i = 0; i < MESH_NODE_END_COUNT; i++)
		{
			nmi.va.append({ node.pos, MESH_ROAD_COL });
			nmi.va.append({ roadCurve[i], MESH_ROAD_COL });
			nmi.va.append({ roadCurve[i + 1], MESH_ROAD_COL });

			nmi.va.append({ roadCurve[i], MESH_PATH_COL });
			nmi.va.append({ pathCurve[i], MESH_PATH_COL });
			nmi.va.append({ roadCurve[i + 1], MESH_PATH_COL });

			nmi.va.append({ roadCurve[i + 1], MESH_PATH_COL });
			nmi.va.append({ pathCurve[i], MESH_PATH_COL });
			nmi.va.append({ pathCurve[i + 1], MESH_PATH_COL });
		}

		return;
	}

	// -- > 1 segments

	// For each segment of the node pull out info
	for (int segId : node.segments)
	{
		const RoadNetworkSegment& segment = network->getSegment(segId);
		const RoadSegmentMeshInfo& smi = segmentMI[segId];

		int side = segment.nodeA == id ? 0 : 1;
		float sideFlip = side == 0 ? 1.0f : -1.0f;
		float angle = Utility::getAngle(smi.n * sideFlip);

		// Place segment end into node info sorted by angle
		for (auto itr = nmi.segmentEnds.begin();; ++itr)
		{
			if (itr == nmi.segmentEnds.end())
			{
				nmi.segmentEnds.push_back({ segId, side, sideFlip, angle });
				break;
			}
			if (itr->angle > angle)
			{
				nmi.segmentEnds.insert(itr, { segId, side, sideFlip, angle });
				break;
			}
		}
	}

	// Loop over segment ends to create intersections
	for (size_t i = 0; i < nmi.segmentEnds.size(); ++i)
	{
		int ni = (i + 1) % nmi.segmentEnds.size();
		nmi.segmentIntersections.push_back({ (int)i, ni });
		RoadNodeSegmentEnd& segEndA = nmi.segmentEnds[i];
		RoadNodeSegmentEnd& segEndB = nmi.segmentEnds[ni];
		RoadSegmentMeshInfo& smiA = segmentMI[segEndA.id];
		RoadSegmentMeshInfo& smiB = segmentMI[segEndB.id];
		RoadNodeSegmentIntersectionInfo& nsii = nmi.segmentIntersections[nmi.segmentIntersections.size() - 1];

		// Calculate specific intersection info
		segEndA.n = smiA.n * segEndA.sideFlip;
		segEndB.n = smiB.n * segEndB.sideFlip;
		segEndA.perp = smiA.perp * segEndA.sideFlip;
		segEndB.perp = smiB.perp * segEndB.sideFlip;

		// Calculate key intersection info
		nsii.angle = Utility::getAngleClockwise(segEndA.n, segEndB.n);
		float istFlip = nsii.angle < M_PI ? -1.0f : 1.0f;
		const sf::Vector2f pathIstA = node.pos + segEndA.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
		const sf::Vector2f pathIstB = node.pos - segEndB.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
		const sf::Vector2f roadIstA = node.pos + segEndA.perp * (World::ROAD_HWIDTH);
		const sf::Vector2f roadIstB = node.pos - segEndB.perp * (World::ROAD_HWIDTH);
		nsii.vPathIst = Utility::getIntersection(pathIstA, segEndA.n * istFlip, pathIstB, segEndB.n * istFlip);
		nsii.vRoadIst = Utility::getIntersection(roadIstA, segEndA.n * istFlip, roadIstB, segEndB.n * istFlip);

		// Update segment mesh information with node offsets
		if (nsii.angle < M_PI)
		{
			const sf::Vector2f istPathD = nsii.vPathIst - node.pos;
			float offsetA = segEndA.n.x * istPathD.x + segEndA.n.y * istPathD.y + World::World::NODE_CURVE_SIZE;
			float offsetB = segEndB.n.x * istPathD.x + segEndB.n.y * istPathD.y + World::World::NODE_CURVE_SIZE;
			if (offsetA > segEndA.offset)
			{
				segEndA.offset = offsetA;
				segEndA.offsetIst = i;
				if (segEndA.side == 0) smiA.nodeOffsetA = offsetA;
				else smiA.nodeOffsetB = offsetA;
			}
			if (offsetB > segEndB.offset)
			{
				segEndB.offset = offsetB;
				segEndB.offsetIst = i;
				if (segEndB.side == 0) smiB.nodeOffsetA = offsetB;
				else smiB.nodeOffsetB = offsetB;
			}
		}
	}

	// Loop over intersections to create wedges and curves
	for (size_t i = 0; i < nmi.segmentIntersections.size(); ++i)
	{
		RoadNodeSegmentIntersectionInfo& nsii = nmi.segmentIntersections[i];

		int ni = (i + 1) % nmi.segmentEnds.size();
		RoadNodeSegmentEnd& segEndLeft = nmi.segmentEnds[i];
		RoadNodeSegmentEnd& segEndRight = nmi.segmentEnds[ni];
		const RoadSegmentMeshInfo& smiLeft = segmentMI[segEndLeft.id];
		const RoadSegmentMeshInfo& smiRight = segmentMI[segEndRight.id];

		segEndLeft.vRoadEndRight = node.pos + segEndLeft.n * segEndLeft.offset + segEndLeft.perp * World::ROAD_HWIDTH;
		segEndRight.vRoadEndLeft = node.pos + segEndRight.n * segEndRight.offset - segEndRight.perp * World::ROAD_HWIDTH;
		segEndLeft.vWedgeRoadRight = nsii.vRoadIst + segEndLeft.n * World::NODE_CURVE_SIZE;
		segEndLeft.vWedgePathRight = nsii.vPathIst + segEndLeft.n * World::NODE_CURVE_SIZE;
		segEndRight.vWedgeRoadLeft = nsii.vRoadIst + segEndRight.n * World::NODE_CURVE_SIZE;
		segEndRight.vWedgePathLeft = nsii.vPathIst + segEndRight.n * World::NODE_CURVE_SIZE;

		// Left segment end right edge
		nmi.va.append({ segEndLeft.vWedgeRoadRight, MESH_PATH_COL });
		nmi.va.append({ segEndLeft.vWedgePathRight, MESH_PATH_COL });
		nmi.va.append({ segEndLeft.vRoadEndRight, MESH_PATH_COL });
		if (segEndLeft.offsetIst != i)
		{
			sf::Vector2f vPathEndRight = node.pos + segEndLeft.n * segEndLeft.offset + segEndLeft.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
			nmi.va.append({ segEndLeft.vWedgePathRight, MESH_PATH_COL });
			nmi.va.append({ vPathEndRight, MESH_PATH_COL });
			nmi.va.append({ segEndLeft.vRoadEndRight, MESH_PATH_COL });
		}

		// Right segment end left edge
		nmi.va.append({ segEndRight.vWedgeRoadLeft, MESH_PATH_COL });
		nmi.va.append({ segEndRight.vWedgePathLeft, MESH_PATH_COL });
		nmi.va.append({ segEndRight.vRoadEndLeft, MESH_PATH_COL });
		if (segEndRight.offsetIst != i)
		{
			sf::Vector2f vPathEndLeft = node.pos + segEndRight.n * segEndRight.offset - segEndRight.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
			nmi.va.append({ segEndRight.vWedgePathLeft, MESH_PATH_COL });
			nmi.va.append({ vPathEndLeft, MESH_PATH_COL });
			nmi.va.append({ segEndRight.vRoadEndLeft, MESH_PATH_COL });
		}

		// Generate curves
		std::vector<sf::Vector2f> roadCurve = Utility::sampleBezier(segEndLeft.vWedgeRoadRight, nsii.vRoadIst, segEndRight.vWedgeRoadLeft, 1.0f, 1.0f, 1.0f, MESH_NODE_CURVE_COUNT);
		std::vector<sf::Vector2f> pathCurve = Utility::sampleBezier(segEndLeft.vWedgePathRight, nsii.vPathIst, segEndRight.vWedgePathLeft, 1.0f, 1.0f, 1.0f, MESH_NODE_CURVE_COUNT);

		sf::Vector2f roadMid = (segEndLeft.vWedgeRoadRight + segEndRight.vWedgeRoadLeft) / 2.0f;
		nsii.vRoadIstMid = nsii.angle > M_PI ? roadMid : nsii.vRoadIst;
		for (int i = 0; i < MESH_NODE_CURVE_COUNT; i++)
		{
			nmi.va.append({ nsii.vRoadIstMid, MESH_ROAD_COL });
			nmi.va.append({ roadCurve[i], MESH_ROAD_COL });
			nmi.va.append({ roadCurve[i + 1], MESH_ROAD_COL });

			nmi.va.append({ roadCurve[i], MESH_PATH_COL });
			nmi.va.append({ pathCurve[i], MESH_PATH_COL });
			nmi.va.append({ roadCurve[i + 1], MESH_PATH_COL });

			nmi.va.append({ roadCurve[i + 1], MESH_PATH_COL });
			nmi.va.append({ pathCurve[i], MESH_PATH_COL });
			nmi.va.append({ pathCurve[i + 1], MESH_PATH_COL });
		}
	}

	// Loop over segment ends to fill in road between wedges
	for (size_t i = 0; i < nmi.segmentEnds.size(); ++i)
	{
		RoadNodeSegmentEnd& segEnd = nmi.segmentEnds[i];
		int pi = (i + nmi.segmentEnds.size() - 1) % nmi.segmentEnds.size();
		RoadNodeSegmentIntersectionInfo& leftNsii = nmi.segmentIntersections[pi];
		RoadNodeSegmentIntersectionInfo& rightNsii = nmi.segmentIntersections[i];

		// Quad of road <-> edge of curve
		nmi.va.append({ segEnd.vWedgeRoadLeft, MESH_ROAD_COL });
		nmi.va.append({ segEnd.vRoadEndLeft, MESH_ROAD_COL });
		nmi.va.append({ segEnd.vWedgeRoadRight, MESH_ROAD_COL });
		nmi.va.append({ segEnd.vWedgeRoadRight, MESH_ROAD_COL });
		nmi.va.append({ segEnd.vRoadEndLeft, MESH_ROAD_COL });
		nmi.va.append({ segEnd.vRoadEndRight, MESH_ROAD_COL });

		// Quad of edge of curve <-> road intersection
		nmi.va.append({ segEnd.vWedgeRoadLeft, MESH_ROAD_COL });
		nmi.va.append({ segEnd.vWedgeRoadRight, MESH_ROAD_COL });
		nmi.va.append({ rightNsii.vRoadIstMid, MESH_ROAD_COL });
		nmi.va.append({ rightNsii.vRoadIstMid, MESH_ROAD_COL });
		nmi.va.append({ leftNsii.vRoadIstMid, MESH_ROAD_COL });
		nmi.va.append({ segEnd.vWedgeRoadLeft, MESH_ROAD_COL });

		// Triangle into middle of node
		if (nmi.segmentEnds.size() > 2)
		{
			nmi.va.append({ leftNsii.vRoadIstMid, MESH_ROAD_COL });
			nmi.va.append({ rightNsii.vRoadIstMid, MESH_ROAD_COL });
			nmi.va.append({ node.pos, MESH_ROAD_COL });
		}
	}

	// Cleanup data
	nmi.segmentIntersections.clear();
	nmi.segmentEnds.clear();
}

void RoadRenderer::createSegmentMesh(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);
	const RoadNetworkNode& nodeA = network->getNode(segment.nodeA);
	const RoadNetworkNode& nodeB = network->getNode(segment.nodeB);
	RoadSegmentMeshInfo& smi = segmentMI[id];

	sf::Vector2f segEndA = nodeA.pos + smi.n * smi.nodeOffsetA;
	sf::Vector2f segEndB = nodeB.pos - smi.n * smi.nodeOffsetB;

	smi.va = sf::VertexArray(sf::Triangles);

	const auto addQuad = [&](const sf::Vertex& a, const sf::Vertex& b, const sf::Vertex& c, const sf::Vertex& d)
	{
		smi.va.append(a);
		smi.va.append(b);
		smi.va.append(c);
		smi.va.append(a);
		smi.va.append(c);
		smi.va.append(d);
	};

	addQuad(
		{ segEndA - smi.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH), MESH_PATH_COL },
		{ segEndB - smi.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH), MESH_PATH_COL },
		{ segEndB - smi.perp * World::ROAD_HWIDTH, MESH_PATH_COL },
		{ segEndA - smi.perp * World::ROAD_HWIDTH, MESH_PATH_COL }
	);

	addQuad(
		{ segEndA - smi.perp * World::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndB - smi.perp * World::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndB + smi.perp * World::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndA + smi.perp * World::ROAD_HWIDTH, MESH_ROAD_COL }
	);

	addQuad(
		{ segEndA + smi.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH), MESH_PATH_COL },
		{ segEndB + smi.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH), MESH_PATH_COL },
		{ segEndB + smi.perp * World::ROAD_HWIDTH, MESH_PATH_COL },
		{ segEndA + smi.perp * World::ROAD_HWIDTH, MESH_PATH_COL }
	);

	segmentMI[id] = std::move(smi);
}
