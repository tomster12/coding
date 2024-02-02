
#pragma once
#include <bitset>
#include "ThreadPool.h"


// https://www.david-colson.com/2020/02/09/making-a-simple-ecs.html

namespace ecs {

	// Constants
	const int MAX_COMPONENTS = 4;
	const int MAX_ENTITIES = 1'000'100;


	#pragma region Base System

	// Entity type declarations
	typedef unsigned int EntityIndex;
	typedef unsigned int EntityVersion;
	typedef unsigned long long EntityID;
	typedef std::bitset<MAX_COMPONENTS> ComponentMask;


	// Helper functions for Entity ID
	inline EntityID createEntityID(EntityIndex index, EntityVersion version) {
		return ((EntityID)index << 32) | ((EntityID)version); }
	inline EntityIndex getEntityIndex(EntityID id) { return id >> 32; }
	inline EntityVersion getEntityVersion(EntityID id) { return (EntityVersion)id; }
	inline bool isEntityValid(EntityID id) { return (id >> 32) != EntityIndex(-1); }
	#define INVALID_ENTITY createEntityID(EntityIndex(-1), 0)


	// Returns unique ID for each type
	static unsigned int s_componentCounter = 0;
	template <class T>
	unsigned int getID() {
		static unsigned int s_componentID = s_componentCounter++;
		return s_componentID;
	}


	struct Entity {

		EntityID id;
		ComponentMask mask;
	};


	struct ComponentPool {

		char* pData{ nullptr };
		size_t elementSize{ 0 };

		ComponentPool(size_t elementSize_) {
			elementSize = elementSize_;
			pData = new char[elementSize * MAX_ENTITIES];
		}

		~ComponentPool() { delete[] pData; }

		inline void* get(size_t entityIndex) {
			return pData + entityIndex * elementSize;
		}
	};


	struct Scene {

		// Declare variables
		std::vector<Entity> entities;
		std::vector<EntityIndex> freeEntities;
		std::vector<ComponentPool*> componentPools;
		std::map<unsigned long, std::vector<EntityID>> viewCache;


		EntityID createEntity() {
			// Check free entities first
			if (!freeEntities.empty()) {
				EntityIndex newIndex = freeEntities.back();
				freeEntities.pop_back();
				EntityID newID = createEntityID(newIndex, getEntityVersion(entities[newIndex].id));
				entities[newIndex].id = newID;
				return entities[newIndex].id;
			}

			// Create new entity and return ID
			entities.push_back({ createEntityID(EntityIndex(entities.size()), 0), ComponentMask() });
			viewCache.clear();
			return entities.back().id;
		}


		void destroyEntity(EntityID entityID) {
			// Override ID and mask for the given ID to null
			const EntityID newID = createEntityID(EntityIndex(-1), getEntityVersion(entityID) + 1);
			entities[getEntityIndex(entityID)].id = newID;
			entities[getEntityIndex(entityID)].mask.reset();
			freeEntities.push_back(getEntityIndex(entityID));
			viewCache.clear();
		}


		template<typename T>
		T* assign(EntityID entityID) {
			// Ensure entity still exists
			if (entities[getEntityIndex(entityID)].id != entityID) return nullptr;

			// Get the ID of the new component
			const unsigned int componentID = getID<T>();

			// Resize component pool list and create new pool if needed
			if (componentPools.size() <= componentID)
				componentPools.resize(componentID + 1, nullptr);
			if (componentPools[componentID] == nullptr)
				componentPools[componentID] = new ComponentPool(sizeof(T));

			// Create component, update bitmask, return component
			T* component = new (componentPools[componentID]->get(getEntityIndex(entityID))) T();
			entities[getEntityIndex(entityID)].mask.set(componentID);
			viewCache.clear();
			return component;
		}


		template<typename T>
		T* get(EntityID entityID, bool check = true) {
			// Ensure entity still exists
			if (check && entities[getEntityIndex(entityID)].id != entityID) return nullptr;

			// Get the ID of the component
			int componentID = getID<T>();

			// Ensure that entity has component
			if (check && !entities[getEntityIndex(entityID)].mask.test(componentID)) return nullptr;

			// Get the specific component and return
			T* component = static_cast<T*>(componentPools[componentID]->get(getEntityIndex(entityID)));
			return component;
		}


		template<typename T>
		void remove(EntityID entityID) {
			// Ensure entity still exists
			if (entities[getEntityIndex(entityID)].id != entityID) return;

			// Remove the component with the given ID
			int componentID = getID<T>();
			entities[getEntityIndex(entityID)].mask.reset(componentID);
		}


		void log() {
			std::cout << "-- Scene Information --" << std::endl;
			std::cout << "Entity Count: " << entities.size() << " / " << MAX_ENTITIES << std::endl;
			std::cout << "Component Count: " << MAX_COMPONENTS << std::endl;
			std::cout << std::endl;
		}
	};


	template<typename... ComponentTypes>
	std::vector<EntityID> getSceneView(Scene& scene) {
		// Setup variables
		bool all = false;
		ComponentMask mask;
		std::vector<EntityID> entities;

		// Given empty list default full
		if (sizeof...(ComponentTypes) == 0) all = true;

		// Unpack the components into list and mask
		else {
			const unsigned int componentIDs[] = { 0, getID<ComponentTypes>() ... };
			for (int i = 1; i < (sizeof...(ComponentTypes) + 1); i++) {
				mask.set(componentIDs[i]);
			}
		}

		// Handle caching
		if (scene.viewCache.count(mask.to_ulong()) > 0) return scene.viewCache[mask.to_ulong()];

		// Get all entities
		for (size_t i = 0; i < scene.entities.size(); i++) {
			if (isEntityValid(scene.entities[i].id)
				&& (all || mask == (mask & scene.entities[i].mask))) {
				entities.emplace_back(scene.entities[i].id);
			}
		}

		// Return completed vector
		scene.viewCache[mask.to_ulong()] = entities;
		return entities;
	}

	#pragma endregion


	#pragma region Implementation

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


	struct Transform {
		sf::Vector2f pos{ 0.0f, 0.0f };
		float scale{ 1.0f };
	};

	struct Attractor {
		float strength{ 1.0f };
	};

	struct Particle {
		sf::Vertex vtx;
	};

	struct DynamicBody {
		sf::Vector2f vel{ 0.0f, 0.0f };
	};


	namespace system {

		static ThreadPool threadPool;
		static void threadpoolProcess(std::function<void(std::vector<EntityID>)> process, std::vector<EntityID> entities) {
			// Function to split process into multiple sub functions
			auto processSplitter = [=](std::vector<EntityID> entities, size_t start, size_t end) {
				std::vector<EntityID> subEntities(entities.begin() + start, entities.begin() + end);
				return [=] { process(subEntities); };
			};

			// Process with multiple threads
			const size_t entityCount = entities.size();
			const size_t threadCount = threadPool.size();
			const size_t gap = entityCount / threadCount;
			std::vector<std::future<void>> results(threadCount);
			for (size_t i = 0; i < threadCount; i++) {
				int threadStart = i * gap;
				int threadEnd = static_cast<int>(std::min(threadStart + gap, entityCount));
				results[i] = threadPool.enqueue(processSplitter(entities, threadStart, threadEnd));
			}

			// Wait for all threads to finish
			for (auto&& result : results) result.get();
		}


		static void instUpdateGravity(Scene* scene, sf::RenderWindow* window, const float dt) {
			// Setup scope variables for process
			const sf::Vector2u size = window->getSize();
			const std::vector<EntityID> attractors = getSceneView<Transform, Attractor>(*scene);
			const size_t attractorCount = attractors.size();
			
			// Create processing function
			auto process = [=](std::vector<EntityID> entities) {
				for (size_t i = 0; i < entities.size(); i++) {

					// Get components
					Transform* t = scene->get<Transform>(entities[i], false);
					DynamicBody* db = scene->get<DynamicBody>(entities[i], false);

					// Apply force towards all attractors
					for (size_t o = 0; o < attractorCount; o++) {
						Transform* at = scene->get<Transform>(attractors[o], false);
						sf::Vector2f diff = at->pos - t->pos;
						float mag = static_cast<float>(std::sqrt(diff.x * diff.x + diff.y * diff.y));
						diff *= 5.0f / mag;
						db->vel += diff;
					}
				}
			};

			// Multithread the process function
			const std::vector<EntityID> entities = getSceneView<Transform, DynamicBody>(*scene);
			threadpoolProcess(process, entities);
		}


		static void instUpdateDynamics(Scene* scene, sf::RenderWindow* window, const float dt) {
			// Create processing function
			auto process = [=](std::vector<EntityID> entities) {
				for (size_t i = 0; i < entities.size(); i++) {

					// Get components
					Transform* t = scene->get<Transform>(entities[i], false);
					DynamicBody* db = scene->get<DynamicBody>(entities[i], false);

					// Apply velocity to position
					t->pos += db->vel * dt;

					// Apply friction to velocity
					db->vel *= 0.995f;
				}
			};
			
			// Multithread the process function
			const std::vector<EntityID> entities = getSceneView<Transform, DynamicBody>(*scene);
			threadpoolProcess(process, entities);
		}


		static void instRenderAttractors(Scene* scene, sf::RenderWindow* window, const float dt) {
			
			// Create processing function
			auto process = [=](std::vector<EntityID> entities) {
				sf::CircleShape shape(10);
				shape.setOrigin(5, 5);
				for (size_t i = 0; i < entities.size(); i++) {

					// Get components
					Transform* t = scene->get<Transform>(entities[i], false);

					// Draw as circle
					shape.setPosition(t->pos);
					window->draw(shape);
				}
			};

			// Process with multiple threads
			const std::vector<EntityID> entities = getSceneView<Transform, Attractor>(*scene);
			process(entities);
		}


		static void instRenderParticles(Scene* scene, sf::RenderWindow* window, const float dt) {
			// Create processing function
			auto process = [=](std::vector<EntityID> entities) {			
				sf::VertexArray circles(sf::Points, entities.size());
				for (size_t i = 0; i < entities.size(); i++) {

					// Get components
					Transform* t = scene->get<Transform>(entities[i], false);
					Particle* s = scene->get<Particle>(entities[i], false);

					// Draw circle as pixel
					s->vtx.position = t->pos;
					s->vtx.texCoords = t->pos;
					circles.append(s->vtx);
				}

				// Draw vertex array to screen
				window->draw(circles);
			};

			// Process with multiple threads
			const std::vector<EntityID> entities = getSceneView<Transform, Particle>(*scene);
			process(entities);
		}
	}

	#pragma endregion
}
