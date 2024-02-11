#include "stdafx.h"
#include "PlayerController.h"
#include "Utility.h"
#include "Game.h"
#include "RoadRenderer.h"

const float PlayerController::CAM_POS_VEL = 1.0f;
const float PlayerController::CAM_SCROLL_ACC = 0.04f;
const float PlayerController::CAM_SCROLL_DRAG = 0.8f;

PlayerController::PlayerController(Game* game, Simulation* simulation, World* world)
	: game(game), simulation(simulation), world(world)
{
	// Initialize view of the world
	window = game->getWindow();
	baseViewSize = (sf::Vector2f)window->getSize();
	camView = sf::View(sf::FloatRect(0.0f, 0.0f, baseViewSize.x, baseViewSize.y));
	camPos = baseViewSize / 2.0f;
	camZoom = 1.0f;
	camZoomVel = 0.0f;

	// Setup building
	buildingRoadNetwork = new RoadNetwork();
	buildingRoadRenderer = new RoadRenderer(buildingRoadNetwork, true);
	buildingNodeFrom = 3;
	buildingBNodeFrom = buildingRoadNetwork->addNode(world->getRoadNetwork()->getNode(buildingNodeFrom).pos);
	buildingBNodeTo = buildingRoadNetwork->addNode(0.0f, 0.0f);
	buildingRoadNetwork->addSegment(buildingBNodeFrom, buildingBNodeTo);

	// Intialize indicator
	indicator = sf::CircleShape(4);
	indicator.setOrigin(4, 4);
}

PlayerController::~PlayerController()
{
	delete buildingRoadNetwork;
	delete buildingRoadRenderer;
}

void PlayerController::update()
{
	const sf::Vector2i& mousePos = game->getMousePos();
	const sf::Vector2i& mousePosPrev = game->getMousePosPrev();
	float mouseScrollDelta = game->getMouseScrollDelta();
	RoadNetwork* roadNetwork = world->getRoadNetwork();
	RoadRenderer* roadRenderer = world->getRoadRenderer();
	sf::Vector2f worldMousePos = window->mapPixelToCoords(mousePos);

	// Handle camera movement and zoom
	sf::Vector2f mouseDiff = (sf::Vector2f)(mousePos - mousePosPrev);
	if (sf::Mouse::isButtonPressed(sf::Mouse::Left)) camPos -= mouseDiff * CAM_POS_VEL * camZoom;
	camZoomVel = (mouseScrollDelta != 0 ? -mouseScrollDelta : camZoomVel);
	camZoom *= 1.0f + camZoomVel * CAM_SCROLL_ACC;
	camZoomVel *= CAM_SCROLL_DRAG;
	camView.setCenter(camPos);
	camView.setSize(baseViewSize * camZoom);
	game->setView(camView);

	// Building new nodes
	buildingRoadNetwork->moveNode(buildingBNodeTo, worldMousePos);
	if (sf::Mouse::isButtonPressed(sf::Mouse::Right))
	{
		if (!nodePlacementLock)
		{
			int newNode = roadNetwork->addNode(worldMousePos);
			roadNetwork->addSegment(buildingNodeFrom, newNode);
			buildingRoadNetwork->moveNode(buildingBNodeFrom, worldMousePos);
			buildingNodeFrom = newNode;
			nodePlacementLock = true;
		}
	}
	else nodePlacementLock = false;

	// Find closest segment and draw indicator on it
	int closestSegmentUid = roadNetwork->getClosestSegment(worldMousePos);
	const auto& closestSegment = roadNetwork->getSegment(closestSegmentUid);
	sf::Vector2f p = Utility::getClosestPointOnLine(
		worldMousePos,
		roadNetwork->getNode(closestSegment.nodeA).pos,
		roadNetwork->getNode(closestSegment.nodeB).pos);
	indicator.setPosition(p);
}

void PlayerController::queueRenders(DrawQueue& drawQueue)
{
	drawQueue.queue({ 4.0f, &indicator });
	buildingRoadRenderer->queueRenders(drawQueue, 2);
}
