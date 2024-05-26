#pragma once
#include "ecs.h"

namespace ecs
{
	//			Current CPU usage

	//	Test 1 (Debug, x86: 50,000, no attractors)
	// 50%		particle render
	// 25%		scene->getView()
	// 13%		updateGravity calculations
	// 8%		updateDynamic calculations

	//	Test 2 (Debug, x86: 50,000, attractors)
	// 43%		particle render
	// 19%		scene->getView()
	// 25%		updateGravity calculations
	// 5%		updateDynamic calculations

	// Test 3 (Debug, x86: 100,000, attractors)
	// 65%		updateGravity
	// - 29%		get
	// - 9%			sqrt
	// 14%		updateDynamics
	// - 10%		get
	// 14%		renderParticles
	// - 5%			get
	// 3%		threadpoolProcess

	// Potential optimizations
	// - (calculations consist of scene->getView and scene->get)
	// - Cache components along with scene view
	// - Move process() lambda to seperate function for each
	// - Look up GPU instancing(?)

	namespace component
	{
		struct Transform
		{
			sf::Vector2f pos{ 0.0f, 0.0f };
			float scale{ 1.0f };
		};

		struct Attractor
		{
			float strength{ 1.0f };
		};

		struct Particle
		{
			sf::Vertex vtx;
		};

		struct DynamicBody
		{
			sf::Vector2f vel{ 0.0f, 0.0f };
		};
	}

	namespace system
	{
		static void instUpdateGravity(Scene* scene, sf::RenderWindow* window, const float dt)
		{
			// Setup scope variables for process
			const sf::Vector2u size = window->getSize();
			const std::vector<EntityID> attractors = getSceneView<component::Transform, component::Attractor>(*scene);
			const size_t attractorCount = attractors.size();

			// Create processing function
			auto process = [=](std::vector<EntityID> entities)
			{
				for (size_t i = 0; i < entities.size(); i++)
				{
					// Get components
					component::Transform* t = scene->get<component::Transform>(entities[i], false);
					component::DynamicBody* db = scene->get<component::DynamicBody>(entities[i], false);

					// Apply force towards all attractors
					for (size_t o = 0; o < attractorCount; o++)
					{
						component::Transform* at = scene->get<component::Transform>(attractors[o], false);
						sf::Vector2f diff = at->pos - t->pos;
						float mag = static_cast<float>(std::sqrt(diff.x * diff.x + diff.y * diff.y));
						diff *= 5.0f / mag;
						db->vel += diff;
					}
				}
			};

			// Multithread the process function
			const std::vector<EntityID> entities = getSceneView<component::Transform, component::DynamicBody>(*scene);
			threadpoolProcess(process, entities);
		}

		static void instUpdateDynamics(Scene* scene, sf::RenderWindow* window, const float dt)
		{
			// Create processing function
			auto process = [=](std::vector<EntityID> entities)
			{
				for (size_t i = 0; i < entities.size(); i++)
				{
					// Get components
					component::Transform* t = scene->get<component::Transform>(entities[i], false);
					component::DynamicBody* db = scene->get<component::DynamicBody>(entities[i], false);

					// Apply velocity to position
					t->pos += db->vel * dt;

					// Apply friction to velocity
					db->vel *= 0.995f;
				}
			};

			// Multithread the process function
			const std::vector<EntityID> entities = getSceneView<component::Transform, component::DynamicBody>(*scene);
			threadpoolProcess(process, entities);
		}

		static void instRenderAttractors(Scene* scene, sf::RenderWindow* window, const float dt)
		{
			// Create processing function
			auto process = [=](std::vector<EntityID> entities)
			{
				sf::CircleShape shape(10);
				shape.setOrigin(5, 5);
				for (size_t i = 0; i < entities.size(); i++)
				{
					// Get components
					component::Transform* t = scene->get<component::Transform>(entities[i], false);

					// Draw as circle
					shape.setPosition(t->pos);
					window->draw(shape);
				}
			};

			// Process with multiple threads
			const std::vector<EntityID> entities = getSceneView<component::Transform, component::Attractor>(*scene);
			process(entities);
		}

		static void instRenderParticles(Scene* scene, sf::RenderWindow* window, const float dt)
		{
			// Create processing function
			auto process = [=](std::vector<EntityID> entities)
			{
				sf::VertexArray circles(sf::Points, entities.size());
				for (size_t i = 0; i < entities.size(); i++)
				{
					// Get components
					component::Transform* t = scene->get<component::Transform>(entities[i], false);
					component::Particle* s = scene->get<component::Particle>(entities[i], false);

					// Draw circle as pixel
					s->vtx.position = t->pos;
					s->vtx.texCoords = t->pos;
					circles.append(s->vtx);
				}

				// Draw vertex array to screen
				window->draw(circles);
			};

			// Process with multiple threads
			const std::vector<EntityID> entities = getSceneView<component::Transform, component::Particle>(*scene);
			process(entities);
		}
	}
}
