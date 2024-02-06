#include "stdafx.h"
#include "RoadRenderer.h"
#include "Utility.h"

const float RoadRenderer::MESH_ROAD_HWIDTH = 10.0f;
const float RoadRenderer::MESH_PATH_HWIDTH = 10.0f;
const float RoadRenderer::MESH_NODE_CURVE = 10.0f;
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
	const RoadSegment& segment = network->getSegment(id);
	initSegmentMeshInfo(id);
	nodesToUpdate.insert(segment.nodeA);
	nodesToUpdate.insert(segment.nodeB);
	segmentsToUpdate.insert(id);
}

void RoadRenderer::onRemoveSegment(int id)
{
	const RoadSegment& segment = network->getSegment(id);
	nodesToUpdate.insert(segment.nodeA);
	nodesToUpdate.insert(segment.nodeB);
	segmentsToUpdate.insert(id);
}

void RoadRenderer::initSegmentMeshInfo(int id)
{
	const RoadSegment& segment = network->getSegment(id);
	const RoadNode& nodeA = network->getNode(segment.nodeA);
	const RoadNode& nodeB = network->getNode(segment.nodeB);

	segmentMI[id] = {};
	RoadSegmentMeshInfo& smi = segmentMI[id];

	smi.d = nodeB.pos - nodeA.pos;
	smi.norm = sqrt(smi.d.x * smi.d.x + smi.d.y * smi.d.y);
	smi.n = smi.d / smi.norm;
	smi.perp = { -smi.n.y, smi.n.x };
}

void RoadRenderer::createNodeMesh(int id)
{
	const RoadNode& node = network->getNode(id);

	nodeMI[id] = {};
	RoadNodeMeshInfo& nmi = nodeMI[id];
	nmi.va = sf::VertexArray{ sf::Triangles };

	/*const auto addQuad = [&](const sf::Vertex& a, const sf::Vertex& b, const sf::Vertex& c, const sf::Vertex& d)
	{
		nmi.va.append(a);
		nmi.va.append(b);
		nmi.va.append(c);
		nmi.va.append(a);
		nmi.va.append(c);
		nmi.va.append(d);
	};*/

	// -- 0 segments
	if (node.segments.size() == 0) return;

	// -- 1 segments
	if (node.segments.size() == 1)
	{
		int segId = *node.segments.begin();
		const RoadSegment& segment = network->getSegment(segId);
		RoadSegmentMeshInfo& smi = segmentMI[segId];

		int side = segment.nodeA == id ? 0 : 1;
		float sideFlip = side == 0 ? 1.0f : -1.0f;
		const sf::Vector2f n = smi.n * sideFlip;

		//nmi.va.append({ node.pos, sf::Color::White });
		//nmi.va.append({ node.pos - n * 40.0f, sf::Color::Yellow });

		return;
	}

	// -- > 1 segments

	// For each segment of the node pull out info
	for (int segId : node.segments)
	{
		const RoadSegment& segment = network->getSegment(segId);
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
		const sf::Vector2f pathIstA = node.pos + segEndA.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH);
		const sf::Vector2f pathIstB = node.pos - segEndB.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH);
		const sf::Vector2f roadIstA = node.pos + segEndA.perp * (MESH_ROAD_HWIDTH);
		const sf::Vector2f roadIstB = node.pos - segEndB.perp * (MESH_ROAD_HWIDTH);
		nsii.vPathIst = Utility::getIntersection(pathIstA, segEndA.n * istFlip, pathIstB, segEndB.n * istFlip);
		nsii.vRoadIst = Utility::getIntersection(roadIstA, segEndA.n * istFlip, roadIstB, segEndB.n * istFlip);

		// Update segment mesh information with node offsets
		if (nsii.angle < M_PI)
		{
			const sf::Vector2f istPathD = nsii.vPathIst - node.pos;
			float offsetA = segEndA.n.x * istPathD.x + segEndA.n.y * istPathD.y + MESH_NODE_CURVE;
			float offsetB = segEndB.n.x * istPathD.x + segEndB.n.y * istPathD.y + MESH_NODE_CURVE;
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

	// Loop over intersections to create wedges
	for (size_t i = 0; i < nmi.segmentIntersections.size(); ++i)
	{
		RoadNodeSegmentIntersectionInfo& nsii = nmi.segmentIntersections[i];

		int ni = (i + 1) % nmi.segmentEnds.size();
		RoadNodeSegmentEnd& segEndLeft = nmi.segmentEnds[i];
		RoadNodeSegmentEnd& segEndRight = nmi.segmentEnds[ni];
		const RoadSegmentMeshInfo& smiLeft = segmentMI[segEndLeft.id];
		const RoadSegmentMeshInfo& smiRight = segmentMI[segEndRight.id];

		segEndLeft.vRoadEndRight = node.pos + segEndLeft.n * segEndLeft.offset + segEndLeft.perp * MESH_ROAD_HWIDTH;
		segEndRight.vRoadEndLeft = node.pos + segEndRight.n * segEndRight.offset - segEndRight.perp * MESH_ROAD_HWIDTH;
		segEndLeft.vWedgeRoadRight = nsii.vRoadIst + segEndLeft.n * MESH_NODE_CURVE;
		segEndLeft.vWedgePathRight = nsii.vPathIst + segEndLeft.n * MESH_NODE_CURVE;
		segEndRight.vWedgeRoadLeft = nsii.vRoadIst + segEndRight.n * MESH_NODE_CURVE;
		segEndRight.vWedgePathLeft = nsii.vPathIst + segEndRight.n * MESH_NODE_CURVE;

		// Left segment end right edge
		nmi.va.append({ segEndLeft.vWedgeRoadRight, MESH_PATH_COL });
		nmi.va.append({ segEndLeft.vWedgePathRight, MESH_PATH_COL });
		nmi.va.append({ segEndLeft.vRoadEndRight, MESH_PATH_COL });
		if (segEndLeft.offsetIst != i)
		{
			sf::Vector2f vPathEndRight = node.pos + segEndLeft.n * segEndLeft.offset + segEndLeft.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH);
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
			sf::Vector2f vPathEndLeft = node.pos + segEndRight.n * segEndRight.offset - segEndRight.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH);
			nmi.va.append({ segEndRight.vWedgePathLeft, MESH_PATH_COL });
			nmi.va.append({ vPathEndLeft, MESH_PATH_COL });
			nmi.va.append({ segEndRight.vRoadEndLeft, MESH_PATH_COL });
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
		nmi.va.append({ rightNsii.vRoadIst, MESH_ROAD_COL });
		nmi.va.append({ rightNsii.vRoadIst, MESH_ROAD_COL });
		nmi.va.append({ leftNsii.vRoadIst, MESH_ROAD_COL });
		nmi.va.append({ segEnd.vWedgeRoadLeft, MESH_ROAD_COL });

		// Triangle into middle of node
		if (nmi.segmentEnds.size() > 2)
		{
			nmi.va.append({ leftNsii.vRoadIst, MESH_ROAD_COL });
			nmi.va.append({ rightNsii.vRoadIst, MESH_ROAD_COL });
			nmi.va.append({ node.pos, MESH_ROAD_COL });
		}

		// Debug mesh for curves
		nmi.va.append({ leftNsii.vPathIst, sf::Color::Magenta });
		nmi.va.append({ segEnd.vWedgePathLeft, sf::Color::Magenta });
		nmi.va.append({ segEnd.vWedgeRoadLeft, sf::Color::Magenta });
		nmi.va.append({ segEnd.vWedgeRoadLeft, sf::Color::Magenta });
		nmi.va.append({ leftNsii.vRoadIst, sf::Color::Magenta });
		nmi.va.append({ leftNsii.vPathIst, sf::Color::Magenta });

		nmi.va.append({ rightNsii.vPathIst, sf::Color::Magenta });
		nmi.va.append({ segEnd.vWedgePathRight, sf::Color::Magenta });
		nmi.va.append({ segEnd.vWedgeRoadRight, sf::Color::Magenta });
		nmi.va.append({ segEnd.vWedgeRoadRight, sf::Color::Magenta });
		nmi.va.append({ rightNsii.vRoadIst, sf::Color::Magenta });
		nmi.va.append({ rightNsii.vPathIst, sf::Color::Magenta });
	}
}

void RoadRenderer::createSegmentMesh(int id)
{
	const RoadSegment& segment = network->getSegment(id);
	const RoadNode& nodeA = network->getNode(segment.nodeA);
	const RoadNode& nodeB = network->getNode(segment.nodeB);
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
		{ segEndA - smi.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH), MESH_PATH_COL },
		{ segEndB - smi.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH), MESH_PATH_COL },
		{ segEndB - smi.perp * MESH_ROAD_HWIDTH, MESH_PATH_COL },
		{ segEndA - smi.perp * MESH_ROAD_HWIDTH, MESH_PATH_COL }
	);

	addQuad(
		{ segEndA - smi.perp * MESH_ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndB - smi.perp * MESH_ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndB + smi.perp * MESH_ROAD_HWIDTH, MESH_ROAD_COL },
		{ segEndA + smi.perp * MESH_ROAD_HWIDTH, MESH_ROAD_COL }
	);

	addQuad(
		{ segEndA + smi.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH), MESH_PATH_COL },
		{ segEndB + smi.perp * (MESH_ROAD_HWIDTH + MESH_PATH_HWIDTH), MESH_PATH_COL },
		{ segEndB + smi.perp * MESH_ROAD_HWIDTH, MESH_PATH_COL },
		{ segEndA + smi.perp * MESH_ROAD_HWIDTH, MESH_PATH_COL }
	);

	segmentMI[id] = std::move(smi);
}
