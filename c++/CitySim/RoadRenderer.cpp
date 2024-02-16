#include "stdafx.h"
#include "RoadRenderer.h"
#include "World.h"
#include "Utility.h"

const int RoadRenderer::MESH_NODE_CURVE_COUNT = 10;
const int RoadRenderer::MESH_NODE_END_COUNT = 10;
const sf::Color RoadRenderer::MESH_ROAD_COL = sf::Color(100, 100, 100);
const sf::Color RoadRenderer::MESH_PATH_COL = sf::Color(180, 180, 180);
const sf::Color RoadRenderer::MESH_TEMP_COL = sf::Color(255, 255, 255, 100);

RoadRenderer::RoadRenderer(RoadNetwork* network, bool isTemporary)
	: network(network), isTemporary(isTemporary)
{
	network->subscribeListener(this);
}

void RoadRenderer::queueRenders(DrawQueue& drawQueue, float zIndex)
{
	updateMesh();
	for (auto& mesh : segmentMI)
	{
		drawQueue.queue({ zIndex, &mesh.second.va });
		drawQueue.queue({ zIndex + 0.1f, &mesh.second.colliderVa });
	}
	for (auto& mesh : nodeMI)
	{
		drawQueue.queue({ zIndex, &mesh.second.va });
		drawQueue.queue({ zIndex + 0.1f, &mesh.second.colliderVa });
	}
}

void RoadRenderer::updateMesh()
{
	while (nodesToCreate.size() > 0)
	{
		auto itr = nodesToCreate.begin();
		if (!network->hasNode(*itr))
		{
			nodeMI.erase(*itr);
			for (IRoadRendererListener* l : listeners) l->onRemoveNodeMesh(*itr);
		}
		else
		{
			createNodeMesh(*itr);

			for (IRoadRendererListener* l : listeners) l->onUpdateNodeMesh(*itr);
		}
		nodesToCreate.erase(itr);
	}
	while (segmentsToCreate.size() > 0)
	{
		auto itr = segmentsToCreate.begin();

		if (!network->hasSegment(*itr))
		{
			segmentMI.erase(*itr);
			for (IRoadRendererListener* l : listeners) l->onRemoveSegmentMesh(*itr);
		}
		else
		{
			createSegmentMesh(*itr);
			for (IRoadRendererListener* l : listeners) l->onUpdateSegmentMesh(*itr);
		}
		segmentsToCreate.erase(itr);
	}
}

void RoadRenderer::clear()
{
	nodeMI.clear();
	segmentMI.clear();
	nodesToCreate.clear();
	segmentsToCreate.clear();
}

void RoadRenderer::onMoveNode(int id, const sf::Vector2f& oldPos, const sf::Vector2f& newPos)
{
	for (int seg : network->getNode(id).segments)
	{
		const RoadNetworkSegment& segment = network->getSegment(seg);

		initSegmentMesh(seg);
		nodesToCreate.insert(segment.nodeA);
		nodesToCreate.insert(segment.nodeB);
		for (int seg : network->getNode(segment.nodeA).segments) segmentsToCreate.insert(seg);
		for (int seg : network->getNode(segment.nodeB).segments) segmentsToCreate.insert(seg);
	}
}

void RoadRenderer::onAddSegment(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);

	initSegmentMesh(id);
	nodesToCreate.insert(segment.nodeA);
	nodesToCreate.insert(segment.nodeB);
	for (int seg : network->getNode(segment.nodeA).segments) segmentsToCreate.insert(seg);
	for (int seg : network->getNode(segment.nodeB).segments) segmentsToCreate.insert(seg);
}

void RoadRenderer::onRemoveSegment(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);

	nodesToCreate.insert(segment.nodeA);
	nodesToCreate.insert(segment.nodeB);
	for (int seg : network->getNode(segment.nodeA).segments) segmentsToCreate.insert(seg);
	for (int seg : network->getNode(segment.nodeB).segments) segmentsToCreate.insert(seg);
}

void RoadRenderer::initSegmentMesh(int id)
{
	segmentMI[id] = {};
	RoadSegmentMeshInfo& smi = segmentMI[id];

	const RoadNetworkSegment& segment = network->getSegment(id);
	const RoadNetworkNode& nodeA = network->getNode(segment.nodeA);
	const RoadNetworkNode& nodeB = network->getNode(segment.nodeB);

	smi.d = nodeB.pos - nodeA.pos;
	smi.norm = sqrt(smi.d.x * smi.d.x + smi.d.y * smi.d.y);
	smi.n = smi.d / smi.norm;
	smi.perp = { -smi.n.y, smi.n.x };
}

void RoadRenderer::createNodeMesh(int id)
{
	nodeMI[id] = {};
	RoadNodeMeshInfo& nmi = nodeMI[id];
	nmi.va = sf::VertexArray{ sf::Triangles };
	nmi.colliderVa = sf::VertexArray(sf::LineStrip);

	const RoadNetworkNode& node = network->getNode(id);

	// -- 0 segments

	if (node.segments.size() == 0) return;

	// -- 1 segments

	if (node.segments.size() == 1)
	{
		int seg = *node.segments.begin();
		const RoadNetworkSegment& segment = network->getSegment(seg);
		RoadSegmentMeshInfo& smi = segmentMI[seg];

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

		nmi.colliderVa.append(pathEndLeft);
		nmi.colliderVa.append(pathEndLeft - n * (World::ROAD_HWIDTH + World::PATH_HWIDTH));
		nmi.colliderVa.append(pathEndRight - n * (World::ROAD_HWIDTH + World::PATH_HWIDTH));
		nmi.colliderVa.append(pathEndRight);
		nmi.colliderVa.append(pathEndLeft);

		if (isTemporary)
		{
			for (size_t i = 0; i < nmi.va.getVertexCount(); i++) nmi.va[i].color = MESH_TEMP_COL;
		}
		return;
	}

	// -- > 1 segments

	// For each segment of the node pull out info
	for (int seg : node.segments)
	{
		const RoadNetworkSegment& segment = network->getSegment(seg);
		const RoadSegmentMeshInfo& smi = segmentMI[seg];

		int side = segment.nodeA == id ? 0 : 1;
		float sideFlip = side == 0 ? 1.0f : -1.0f;
		sf::Vector2f n = smi.n * sideFlip;
		float angle = Utility::getAngle(n);
		sf::Vector2f perp = smi.perp * sideFlip;
		RoadNodeSegmentEnd segEnd{ seg, side, sideFlip, angle, n, perp };

		// Place segment end into node info sorted by angle
		for (auto itr = nmi._segmentEnds.begin();; ++itr)
		{
			if (itr == nmi._segmentEnds.end())
			{
				nmi._segmentEnds.push_back(segEnd);
				break;
			}
			if (itr->angle > angle)
			{
				nmi._segmentEnds.insert(itr, segEnd);
				break;
			}
		}
	}

	// Intersection points and segment end offsets
	for (size_t i = 0; i < nmi._segmentEnds.size(); ++i)
	{
		int ni = (i + 1) % nmi._segmentEnds.size();
		nmi._segmentIntersections.push_back({ (int)i, ni });
		RoadNodeSegmentIntersectionInfo& nsii = nmi._segmentIntersections[i];
		RoadNodeSegmentEnd& segEndA = nmi._segmentEnds[i];
		RoadNodeSegmentEnd& segEndB = nmi._segmentEnds[ni];
		RoadSegmentMeshInfo& smiA = segmentMI[segEndA.id];
		RoadSegmentMeshInfo& smiB = segmentMI[segEndB.id];

		// Calculate intersection info
		nsii.angle = Utility::getAngleClockwise(segEndA.n, segEndB.n);
		float istFlip = nsii.angle < M_PI ? -1.0f : 1.0f;
		const sf::Vector2f pathIstA = node.pos + segEndA.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
		const sf::Vector2f pathIstB = node.pos - segEndB.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
		const sf::Vector2f roadIstA = node.pos + segEndA.perp * (World::ROAD_HWIDTH);
		const sf::Vector2f roadIstB = node.pos - segEndB.perp * (World::ROAD_HWIDTH);
		nsii.vPathIst = Utility::getIntersection(pathIstA, segEndA.n * istFlip, pathIstB, segEndB.n * istFlip);
		nsii.vRoadIst = Utility::getIntersection(roadIstA, segEndA.n * istFlip, roadIstB, segEndB.n * istFlip);

		// Update segment ends with node offsets
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
	for (size_t i = 0; i < nmi._segmentIntersections.size(); ++i)
	{
		RoadNodeSegmentIntersectionInfo& nsii = nmi._segmentIntersections[i];

		int ni = (i + 1) % nmi._segmentEnds.size();
		RoadNodeSegmentEnd& segEndLeft = nmi._segmentEnds[i];
		RoadNodeSegmentEnd& segEndRight = nmi._segmentEnds[ni];
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
			segEndLeft.vPathEndRight = node.pos + segEndLeft.n * segEndLeft.offset + segEndLeft.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
			nmi.va.append({ segEndLeft.vWedgePathRight, MESH_PATH_COL });
			nmi.va.append({ segEndLeft.vPathEndRight, MESH_PATH_COL });
			nmi.va.append({ segEndLeft.vRoadEndRight, MESH_PATH_COL });
		}
		else segEndLeft.vPathEndRight = segEndLeft.vWedgePathRight;

		// Right segment end left edge
		nmi.va.append({ segEndRight.vWedgeRoadLeft, MESH_PATH_COL });
		nmi.va.append({ segEndRight.vWedgePathLeft, MESH_PATH_COL });
		nmi.va.append({ segEndRight.vRoadEndLeft, MESH_PATH_COL });
		if (segEndRight.offsetIst != i)
		{
			segEndRight.vPathEndLeft = node.pos + segEndRight.n * segEndRight.offset - segEndRight.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH);
			nmi.va.append({ segEndRight.vWedgePathLeft, MESH_PATH_COL });
			nmi.va.append({ segEndRight.vPathEndLeft, MESH_PATH_COL });
			nmi.va.append({ segEndRight.vRoadEndLeft, MESH_PATH_COL });
		}
		else segEndRight.vPathEndLeft = segEndRight.vWedgePathLeft;

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
	for (size_t i = 0; i < nmi._segmentEnds.size(); ++i)
	{
		RoadNodeSegmentEnd& segEnd = nmi._segmentEnds[i];
		int pi = (i + nmi._segmentEnds.size() - 1) % nmi._segmentEnds.size();
		RoadNodeSegmentIntersectionInfo& leftNsii = nmi._segmentIntersections[pi];
		RoadNodeSegmentIntersectionInfo& rightNsii = nmi._segmentIntersections[i];

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
		if (nmi._segmentEnds.size() > 2)
		{
			nmi.va.append({ leftNsii.vRoadIstMid, MESH_ROAD_COL });
			nmi.va.append({ rightNsii.vRoadIstMid, MESH_ROAD_COL });
			nmi.va.append({ node.pos, MESH_ROAD_COL });
		}

		// Produce collider mesh
		nmi.colliderVa.append(segEnd.vPathEndLeft);
		nmi.colliderVa.append(segEnd.vPathEndRight);
		nmi.colliderVa.append(rightNsii.vPathIst);
	}

	nmi.colliderVa.append(nmi._segmentEnds[0].vPathEndLeft);

	nmi._segmentIntersections.clear();
	nmi._segmentEnds.clear();

	if (isTemporary)
	{
		for (size_t i = 0; i < nmi.va.getVertexCount(); i++) nmi.va[i].color = MESH_TEMP_COL;
	}
}

void RoadRenderer::createSegmentMesh(int id)
{
	RoadSegmentMeshInfo& smi = segmentMI[id];
	smi.va = sf::VertexArray(sf::Triangles);
	smi.colliderVa = sf::VertexArray(sf::LineStrip);

	const RoadNetworkSegment& segment = network->getSegment(id);
	const RoadNetworkNode& nodeA = network->getNode(segment.nodeA);
	const RoadNetworkNode& nodeB = network->getNode(segment.nodeB);

	sf::Vector2f segEndA = nodeA.pos + smi.n * smi.nodeOffsetA;
	sf::Vector2f segEndB = nodeB.pos - smi.n * smi.nodeOffsetB;

	const auto addQuad = [&](const sf::Vertex& a, const sf::Vertex& b, const sf::Vertex& c, const sf::Vertex& d)
	{
		smi.va.append(a);
		smi.va.append(b);
		smi.va.append(c);
		smi.va.append(a);
		smi.va.append(c);
		smi.va.append(d);
	};

	smi.edgeLeft = {
		0,
		segEndA + smi.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH),
		segEndB + smi.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH)
	};

	smi.edgeRight = {
		1,
		segEndA - smi.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH),
		segEndB - smi.perp * (World::ROAD_HWIDTH + World::PATH_HWIDTH)
	};

	addQuad(
		{ smi.edgeLeft.a, MESH_PATH_COL },
		{ smi.edgeLeft.b, MESH_PATH_COL },
		{ segEndB + smi.perp * World::ROAD_HWIDTH, MESH_PATH_COL },
		{ segEndA + smi.perp * World::ROAD_HWIDTH, MESH_PATH_COL }
	);

	addQuad(
		{ segEndA + smi.perp * World::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndB + smi.perp * World::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndB - smi.perp * World::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndA - smi.perp * World::ROAD_HWIDTH, MESH_ROAD_COL }
	);

	addQuad(
		{ smi.edgeRight.a, MESH_PATH_COL },
		{ smi.edgeRight.b, MESH_PATH_COL },
		{ segEndB - smi.perp * World::ROAD_HWIDTH, MESH_PATH_COL },
		{ segEndA - smi.perp * World::ROAD_HWIDTH, MESH_PATH_COL }
	);

	smi.colliderVa.append(smi.edgeLeft.a);
	smi.colliderVa.append(smi.edgeLeft.b);
	smi.colliderVa.append(smi.edgeRight.b);
	smi.colliderVa.append(smi.edgeRight.a);
	smi.colliderVa.append(smi.edgeLeft.a);

	if (isTemporary)
	{
		for (size_t i = 0; i < smi.va.getVertexCount(); i++) smi.va[i].color = MESH_TEMP_COL;
	}
}
