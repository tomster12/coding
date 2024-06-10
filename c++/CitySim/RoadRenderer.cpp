#include "stdafx.h"
#include "RoadRenderer.h"
#include "Simulation.h"
#include "GeomUtility.h"

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
	for (auto& mesh : segmentMeshes)
	{
		drawQueue.queue({ zIndex, &mesh.second.mainVtx });
		drawQueue.queue({ zIndex + 0.1f, &mesh.second.colliderVtx });
	}
	for (auto& mesh : nodeMeshes)
	{
		drawQueue.queue({ zIndex, &mesh.second.mainVtx });
		drawQueue.queue({ zIndex + 0.1f, &mesh.second.colliderVtx });
	}
}

void RoadRenderer::updateMesh()
{
	while (nodesToUpdate.size() > 0)
	{
		auto itr = nodesToUpdate.begin();
		if (!network->hasNode(*itr))
		{
			nodeMeshes.erase(*itr);
			for (IRoadRendererListener* l : listeners) l->onRemoveNodeMesh(*itr);
		}
		else
		{
			createNodeMesh(*itr);
			for (IRoadRendererListener* l : listeners) l->onUpdateNodeMesh(*itr);
		}
		nodesToUpdate.erase(itr);
	}
	while (segmentsToUpdate.size() > 0)
	{
		auto itr = segmentsToUpdate.begin();
		if (!network->hasSegment(*itr))
		{
			segmentMeshes.erase(*itr);
			for (IRoadRendererListener* l : listeners) l->onRemoveSegmentMesh(*itr);
		}
		else
		{
			createSegmentMesh(*itr);
			for (IRoadRendererListener* l : listeners) l->onUpdateSegmentMesh(*itr);
		}
		segmentsToUpdate.erase(itr);
	}
}

void RoadRenderer::onMoveNode(int id, const sf::Vector2f& oldPos, const sf::Vector2f& newPos)
{
	for (int seg : network->getNode(id).segments)
	{
		const RoadNetworkSegment& segment = network->getSegment(seg);

		initSegmentMesh(seg);
		nodesToUpdate.insert(segment.nodeA);
		nodesToUpdate.insert(segment.nodeB);
		for (int seg : network->getNode(segment.nodeA).segments) segmentsToUpdate.insert(seg);
		for (int seg : network->getNode(segment.nodeB).segments) segmentsToUpdate.insert(seg);
	}
}

void RoadRenderer::onAddSegment(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);

	initSegmentMesh(id);
	nodesToUpdate.insert(segment.nodeA);
	nodesToUpdate.insert(segment.nodeB);
	for (int seg : network->getNode(segment.nodeA).segments) segmentsToUpdate.insert(seg);
	for (int seg : network->getNode(segment.nodeB).segments) segmentsToUpdate.insert(seg);
}

void RoadRenderer::onRemoveSegment(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);

	nodesToUpdate.insert(segment.nodeA);
	nodesToUpdate.insert(segment.nodeB);
	for (int seg : network->getNode(segment.nodeA).segments) segmentsToUpdate.insert(seg);
	for (int seg : network->getNode(segment.nodeB).segments) segmentsToUpdate.insert(seg);
}

void RoadRenderer::clear()
{
	nodeMeshes.clear();
	segmentMeshes.clear();
	nodesToUpdate.clear();
	segmentsToUpdate.clear();
}

void RoadRenderer::initSegmentMesh(int id)
{
	segmentMeshes[id] = {};
	RoadSegmentMesh& segmentMesh = segmentMeshes[id];

	const RoadNetworkSegment& segment = network->getSegment(id);
	const RoadNetworkNode& nodeA = network->getNode(segment.nodeA);
	const RoadNetworkNode& nodeB = network->getNode(segment.nodeB);

	segmentMesh.d = nodeB.pos - nodeA.pos;
	segmentMesh.norm = sqrt(segmentMesh.d.x * segmentMesh.d.x + segmentMesh.d.y * segmentMesh.d.y);
	segmentMesh.n = segmentMesh.d / segmentMesh.norm;
	segmentMesh.perp = { -segmentMesh.n.y, segmentMesh.n.x };
}

void RoadRenderer::createNodeMesh(int id)
{
	const RoadNetworkNode& node = network->getNode(id);
	nodeMeshes[id] = {};
	RoadNodeMesh& nodeMesh = nodeMeshes[id];
	nodeMesh.mainVtx = sf::VertexArray(sf::Triangles);
	nodeMesh.colliderVtx = sf::VertexArray(sf::LineStrip);

	// -- 0 segments

	if (node.segments.size() == 0) return;

	// -- 1 segments

	if (node.segments.size() == 1)
	{
		int segmentID = *node.segments.begin();
		const RoadNetworkSegment& segment = network->getSegment(segmentID);
		RoadSegmentMesh& segmentMesh = segmentMeshes[segmentID];

		int side = segment.nodeA == id ? 0 : 1;
		float sideFlip = side == 0 ? 1.0f : -1.0f;
		const sf::Vector2f n = segmentMesh.n * sideFlip;
		const sf::Vector2f perp = segmentMesh.perp * sideFlip;

		sf::Vector2f pathEndLeft = node.pos - perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH);
		sf::Vector2f roadEndLeft = node.pos - perp * (Simulation::ROAD_HWIDTH);
		sf::Vector2f pathEndRight = node.pos + perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH);
		sf::Vector2f roadEndRight = node.pos + perp * (Simulation::ROAD_HWIDTH);

		// Generate curves
		std::vector<sf::Vector2f> roadCurve = GeomUtility::sampleArc(roadEndRight, node.pos, roadEndLeft, MESH_NODE_END_COUNT);
		std::vector<sf::Vector2f> pathCurve = GeomUtility::sampleArc(pathEndRight, node.pos, pathEndLeft, MESH_NODE_END_COUNT);

		for (int i = 0; i < MESH_NODE_END_COUNT; i++)
		{
			nodeMesh.mainVtx.append({ node.pos, MESH_ROAD_COL });
			nodeMesh.mainVtx.append({ roadCurve[i], MESH_ROAD_COL });
			nodeMesh.mainVtx.append({ roadCurve[i + 1], MESH_ROAD_COL });

			nodeMesh.mainVtx.append({ roadCurve[i], MESH_PATH_COL });
			nodeMesh.mainVtx.append({ pathCurve[i], MESH_PATH_COL });
			nodeMesh.mainVtx.append({ roadCurve[i + 1], MESH_PATH_COL });

			nodeMesh.mainVtx.append({ roadCurve[i + 1], MESH_PATH_COL });
			nodeMesh.mainVtx.append({ pathCurve[i], MESH_PATH_COL });
			nodeMesh.mainVtx.append({ pathCurve[i + 1], MESH_PATH_COL });
		}

		nodeMesh.colliderVtx.append(pathEndLeft);
		nodeMesh.colliderVtx.append(pathEndLeft - n * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH));
		nodeMesh.colliderVtx.append(pathEndRight - n * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH));
		nodeMesh.colliderVtx.append(pathEndRight);
		nodeMesh.colliderVtx.append(pathEndLeft);

		if (isTemporary)
		{
			for (size_t i = 0; i < nodeMesh.mainVtx.getVertexCount(); i++) nodeMesh.mainVtx[i].color = MESH_TEMP_COL;
		}
		return;
	}

	// -- > 1 segments

	// For each segment of the node pull out info
	for (int segmentID : node.segments)
	{
		const RoadNetworkSegment& segment = network->getSegment(segmentID);
		const RoadSegmentMesh& segmentMesh = segmentMeshes[segmentID];

		int side = segment.nodeA == id ? 0 : 1;
		float sideFlip = side == 0 ? 1.0f : -1.0f;
		sf::Vector2f n = segmentMesh.n * sideFlip;
		float angle = GeomUtility::getAngle(n);
		sf::Vector2f perp = segmentMesh.perp * sideFlip;
		RoadNodeSegmentEndInfo segEnd{ segmentID, side, sideFlip, angle, n, perp };

		// Place segment end into node info sorted by angle
		for (auto itr = nodeMesh._segmentEnds.begin();; ++itr)
		{
			if (itr == nodeMesh._segmentEnds.end())
			{
				nodeMesh._segmentEnds.push_back(segEnd);
				break;
			}
			if (itr->angle > angle)
			{
				nodeMesh._segmentEnds.insert(itr, segEnd);
				break;
			}
		}
	}

	// Intersection points and segment end offsets
	for (size_t i = 0; i < nodeMesh._segmentEnds.size(); ++i)
	{
		int ni = (i + 1) % nodeMesh._segmentEnds.size();
		nodeMesh._segmentIntersections.push_back({ (int)i, ni });
		RoadNodeSegmentIntersectionInfo& nsii = nodeMesh._segmentIntersections[i];
		RoadNodeSegmentEndInfo& segEndA = nodeMesh._segmentEnds[i];
		RoadNodeSegmentEndInfo& segEndB = nodeMesh._segmentEnds[ni];
		RoadSegmentMesh& smiA = segmentMeshes[segEndA.id];
		RoadSegmentMesh& smiB = segmentMeshes[segEndB.id];

		// Calculate intersection info
		nsii.angle = GeomUtility::getAngleClockwise(segEndA.n, segEndB.n);
		float istFlip = nsii.angle < M_PI ? -1.0f : 1.0f;
		const sf::Vector2f pathIstA = node.pos + segEndA.perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH);
		const sf::Vector2f pathIstB = node.pos - segEndB.perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH);
		const sf::Vector2f roadIstA = node.pos + segEndA.perp * (Simulation::ROAD_HWIDTH);
		const sf::Vector2f roadIstB = node.pos - segEndB.perp * (Simulation::ROAD_HWIDTH);
		nsii.vPathIst = GeomUtility::getIntersection(pathIstA, segEndA.n * istFlip, pathIstB, segEndB.n * istFlip);
		nsii.vRoadIst = GeomUtility::getIntersection(roadIstA, segEndA.n * istFlip, roadIstB, segEndB.n * istFlip);

		// Update segment ends with node offsets
		if (nsii.angle < M_PI)
		{
			const sf::Vector2f istPathD = nsii.vPathIst - node.pos;
			float offsetA = segEndA.n.x * istPathD.x + segEndA.n.y * istPathD.y + Simulation::Simulation::NODE_CURVE_SIZE;
			float offsetB = segEndB.n.x * istPathD.x + segEndB.n.y * istPathD.y + Simulation::Simulation::NODE_CURVE_SIZE;
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
	for (size_t i = 0; i < nodeMesh._segmentIntersections.size(); ++i)
	{
		RoadNodeSegmentIntersectionInfo& nsii = nodeMesh._segmentIntersections[i];

		int ni = (i + 1) % nodeMesh._segmentEnds.size();
		RoadNodeSegmentEndInfo& segEndLeft = nodeMesh._segmentEnds[i];
		RoadNodeSegmentEndInfo& segEndRight = nodeMesh._segmentEnds[ni];
		const RoadSegmentMesh& smiLeft = segmentMeshes[segEndLeft.id];
		const RoadSegmentMesh& smiRight = segmentMeshes[segEndRight.id];

		segEndLeft.vRoadEndRight = node.pos + segEndLeft.n * segEndLeft.offset + segEndLeft.perp * Simulation::ROAD_HWIDTH;
		segEndRight.vRoadEndLeft = node.pos + segEndRight.n * segEndRight.offset - segEndRight.perp * Simulation::ROAD_HWIDTH;
		segEndLeft.vWedgeRoadRight = nsii.vRoadIst + segEndLeft.n * Simulation::NODE_CURVE_SIZE;
		segEndLeft.vWedgePathRight = nsii.vPathIst + segEndLeft.n * Simulation::NODE_CURVE_SIZE;
		segEndRight.vWedgeRoadLeft = nsii.vRoadIst + segEndRight.n * Simulation::NODE_CURVE_SIZE;
		segEndRight.vWedgePathLeft = nsii.vPathIst + segEndRight.n * Simulation::NODE_CURVE_SIZE;

		// Left segment end right edge
		nodeMesh.mainVtx.append({ segEndLeft.vWedgeRoadRight, MESH_PATH_COL });
		nodeMesh.mainVtx.append({ segEndLeft.vWedgePathRight, MESH_PATH_COL });
		nodeMesh.mainVtx.append({ segEndLeft.vRoadEndRight, MESH_PATH_COL });
		if (segEndLeft.offsetIst != i)
		{
			segEndLeft.vPathEndRight = node.pos + segEndLeft.n * segEndLeft.offset + segEndLeft.perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH);
			nodeMesh.mainVtx.append({ segEndLeft.vWedgePathRight, MESH_PATH_COL });
			nodeMesh.mainVtx.append({ segEndLeft.vPathEndRight, MESH_PATH_COL });
			nodeMesh.mainVtx.append({ segEndLeft.vRoadEndRight, MESH_PATH_COL });
		}
		else segEndLeft.vPathEndRight = segEndLeft.vWedgePathRight;

		// Right segment end left edge
		nodeMesh.mainVtx.append({ segEndRight.vWedgeRoadLeft, MESH_PATH_COL });
		nodeMesh.mainVtx.append({ segEndRight.vWedgePathLeft, MESH_PATH_COL });
		nodeMesh.mainVtx.append({ segEndRight.vRoadEndLeft, MESH_PATH_COL });
		if (segEndRight.offsetIst != i)
		{
			segEndRight.vPathEndLeft = node.pos + segEndRight.n * segEndRight.offset - segEndRight.perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH);
			nodeMesh.mainVtx.append({ segEndRight.vWedgePathLeft, MESH_PATH_COL });
			nodeMesh.mainVtx.append({ segEndRight.vPathEndLeft, MESH_PATH_COL });
			nodeMesh.mainVtx.append({ segEndRight.vRoadEndLeft, MESH_PATH_COL });
		}
		else segEndRight.vPathEndLeft = segEndRight.vWedgePathLeft;

		// Generate curves
		std::vector<sf::Vector2f> roadCurve = GeomUtility::sampleBezier(segEndLeft.vWedgeRoadRight, nsii.vRoadIst, segEndRight.vWedgeRoadLeft, 1.0f, 1.0f, 1.0f, MESH_NODE_CURVE_COUNT);
		std::vector<sf::Vector2f> pathCurve = GeomUtility::sampleBezier(segEndLeft.vWedgePathRight, nsii.vPathIst, segEndRight.vWedgePathLeft, 1.0f, 1.0f, 1.0f, MESH_NODE_CURVE_COUNT);

		sf::Vector2f roadMid = (segEndLeft.vWedgeRoadRight + segEndRight.vWedgeRoadLeft) / 2.0f;
		nsii.vRoadIstMid = nsii.angle > M_PI ? roadMid : nsii.vRoadIst;
		for (int i = 0; i < MESH_NODE_CURVE_COUNT; i++)
		{
			nodeMesh.mainVtx.append({ nsii.vRoadIstMid, MESH_ROAD_COL });
			nodeMesh.mainVtx.append({ roadCurve[i], MESH_ROAD_COL });
			nodeMesh.mainVtx.append({ roadCurve[i + 1], MESH_ROAD_COL });

			nodeMesh.mainVtx.append({ roadCurve[i], MESH_PATH_COL });
			nodeMesh.mainVtx.append({ pathCurve[i], MESH_PATH_COL });
			nodeMesh.mainVtx.append({ roadCurve[i + 1], MESH_PATH_COL });

			nodeMesh.mainVtx.append({ roadCurve[i + 1], MESH_PATH_COL });
			nodeMesh.mainVtx.append({ pathCurve[i], MESH_PATH_COL });
			nodeMesh.mainVtx.append({ pathCurve[i + 1], MESH_PATH_COL });
		}
	}

	// Loop over segment ends to fill in road between wedges
	for (size_t i = 0; i < nodeMesh._segmentEnds.size(); ++i)
	{
		RoadNodeSegmentEndInfo& segEnd = nodeMesh._segmentEnds[i];
		int pi = (i + nodeMesh._segmentEnds.size() - 1) % nodeMesh._segmentEnds.size();
		RoadNodeSegmentIntersectionInfo& leftNsii = nodeMesh._segmentIntersections[pi];
		RoadNodeSegmentIntersectionInfo& rightNsii = nodeMesh._segmentIntersections[i];

		// Quad of road <-> edge of curve
		nodeMesh.mainVtx.append({ segEnd.vWedgeRoadLeft, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ segEnd.vRoadEndLeft, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ segEnd.vWedgeRoadRight, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ segEnd.vWedgeRoadRight, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ segEnd.vRoadEndLeft, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ segEnd.vRoadEndRight, MESH_ROAD_COL });

		// Quad of edge of curve <-> road intersection
		nodeMesh.mainVtx.append({ segEnd.vWedgeRoadLeft, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ segEnd.vWedgeRoadRight, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ rightNsii.vRoadIstMid, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ rightNsii.vRoadIstMid, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ leftNsii.vRoadIstMid, MESH_ROAD_COL });
		nodeMesh.mainVtx.append({ segEnd.vWedgeRoadLeft, MESH_ROAD_COL });

		// Triangle into middle of node
		if (nodeMesh._segmentEnds.size() > 2)
		{
			nodeMesh.mainVtx.append({ leftNsii.vRoadIstMid, MESH_ROAD_COL });
			nodeMesh.mainVtx.append({ rightNsii.vRoadIstMid, MESH_ROAD_COL });
			nodeMesh.mainVtx.append({ node.pos, MESH_ROAD_COL });
		}

		// Produce collider mesh
		nodeMesh.colliderVtx.append(segEnd.vPathEndLeft);
		nodeMesh.colliderVtx.append(segEnd.vPathEndRight);
		nodeMesh.colliderVtx.append(rightNsii.vPathIst);
	}

	nodeMesh.colliderVtx.append(nodeMesh._segmentEnds[0].vPathEndLeft);

	nodeMesh._segmentIntersections.clear();
	nodeMesh._segmentEnds.clear();

	if (isTemporary)
	{
		for (size_t i = 0; i < nodeMesh.mainVtx.getVertexCount(); i++) nodeMesh.mainVtx[i].color = MESH_TEMP_COL;
	}
}

void RoadRenderer::createSegmentMesh(int id)
{
	const RoadNetworkSegment& segment = network->getSegment(id);
	RoadSegmentMesh& segmentMesh = segmentMeshes[id];
	segmentMesh.mainVtx = sf::VertexArray(sf::Triangles);
	segmentMesh.colliderVtx = sf::VertexArray(sf::LineStrip);

	const RoadNetworkNode& nodeA = network->getNode(segment.nodeA);
	const RoadNetworkNode& nodeB = network->getNode(segment.nodeB);
	sf::Vector2f segEndA = nodeA.pos + segmentMesh.n * segmentMesh.nodeOffsetA;
	sf::Vector2f segEndB = nodeB.pos - segmentMesh.n * segmentMesh.nodeOffsetB;

	const auto addQuad = [&](const sf::Vertex& a, const sf::Vertex& b, const sf::Vertex& c, const sf::Vertex& d)
	{
		segmentMesh.mainVtx.append(a);
		segmentMesh.mainVtx.append(b);
		segmentMesh.mainVtx.append(c);
		segmentMesh.mainVtx.append(a);
		segmentMesh.mainVtx.append(c);
		segmentMesh.mainVtx.append(d);
	};

	segmentMesh.edgeLeft = {
		0,
		segEndA + segmentMesh.perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH),
		segEndB + segmentMesh.perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH)
	};

	segmentMesh.edgeRight = {
		1,
		segEndA - segmentMesh.perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH),
		segEndB - segmentMesh.perp * (Simulation::ROAD_HWIDTH + Simulation::PATH_HWIDTH)
	};

	addQuad(
		{ segmentMesh.edgeLeft.a, MESH_PATH_COL },
		{ segmentMesh.edgeLeft.b, MESH_PATH_COL },
		{ segEndB + segmentMesh.perp * Simulation::ROAD_HWIDTH, MESH_PATH_COL },
		{ segEndA + segmentMesh.perp * Simulation::ROAD_HWIDTH, MESH_PATH_COL }
	);

	addQuad(
		{ segEndA + segmentMesh.perp * Simulation::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndB + segmentMesh.perp * Simulation::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndB - segmentMesh.perp * Simulation::ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndA - segmentMesh.perp * Simulation::ROAD_HWIDTH, MESH_ROAD_COL }
	);

	addQuad(
		{ segmentMesh.edgeRight.a, MESH_PATH_COL },
		{ segmentMesh.edgeRight.b, MESH_PATH_COL },
		{ segEndB - segmentMesh.perp * Simulation::ROAD_HWIDTH, MESH_PATH_COL },
		{ segEndA - segmentMesh.perp * Simulation::ROAD_HWIDTH, MESH_PATH_COL }
	);

	segmentMesh.colliderVtx.append(segmentMesh.edgeLeft.a);
	segmentMesh.colliderVtx.append(segmentMesh.edgeLeft.b);
	segmentMesh.colliderVtx.append(segmentMesh.edgeRight.b);
	segmentMesh.colliderVtx.append(segmentMesh.edgeRight.a);
	segmentMesh.colliderVtx.append(segmentMesh.edgeLeft.a);

	if (isTemporary)
	{
		for (size_t i = 0; i < segmentMesh.mainVtx.getVertexCount(); i++) segmentMesh.mainVtx[i].color = MESH_TEMP_COL;
	}
}
