#pragma once
#include <bitset>
#include "ThreadPool.h"

// https://www.david-colson.com/2020/02/09/making-a-simple-ecs.html

namespace ecs
{
	const int MAX_COMPONENTS = 4;
	const int MAX_ENTITIES = 1'000'100;

	// ------------------- Entity Types ------------------- //

	typedef unsigned int EntityIndex; // 4 bytes
	typedef unsigned int EntityVersion; // 4 bytes
	typedef unsigned long long EntityID; // 8 bytes

	inline EntityID createEntityID(EntityIndex index, EntityVersion version)
	{
		// Pack index and version into 8 byte entity ID
		return ((EntityID)index << 32) | ((EntityID)version);
	}

	inline EntityIndex getEntityIndex(EntityID id)
	{
		// Extract index from left 4 bytes of 8 byte entity ID
		return (EntityIndex)(id >> 32);
	}

	inline EntityVersion getEntityVersion(EntityID id)
	{
		// Extract version from right 4 bytes of 8 byte entity ID
		return (EntityVersion)id;
	}

	inline bool isEntityValid(EntityID id)
	{
		// Check if entity is valid by checking if index is not -1
		return (id >> 32) != EntityIndex(-1);
	}

#define INVALID_ENTITY createEntityID(EntityIndex(-1), 0)

	// ------------------- ECS Types ------------------- //

	// Fancy per-type ID generator
	static unsigned int currentID = 0;
	template <class T>
	unsigned int getID()
	{
		static unsigned int componentID = currentID++;
		return componentID;
	}

	typedef std::bitset<MAX_COMPONENTS> ComponentMask;

	// Internal entity <-> component mapping
	struct Entity
	{
		EntityID id;
		ComponentMask mask;
	};

	// Packed structure of a single type of component
	struct ComponentPool
	{
		size_t size{ 0 };
		char* data{ nullptr };

		ComponentPool(size_t size)
		{
			this->size = size;
			data = new char[size * MAX_ENTITIES];
		}

		~ComponentPool()
		{
			delete[] data;
		}

		inline void* get(size_t index)
		{
			return data + index * size;
		}
	};

	// Contains entities and components
	struct Scene
	{
		std::vector<Entity> entities;
		std::vector<EntityIndex> freeEntities;
		std::vector<ComponentPool*> componentPools;
		std::map<unsigned long, std::vector<EntityID>> viewCache;

		~Scene()
		{
			for (auto pool : componentPools) delete pool;
		}

		EntityID createEntity()
		{
			// First use up any free entity slots
			if (!freeEntities.empty())
			{
				EntityIndex newIndex = freeEntities.back();
				EntityVersion newVersion = getEntityVersion(entities[newIndex].id);
				entities[newIndex].id = createEntityID(newIndex, newVersion);
				freeEntities.pop_back();
				return entities[newIndex].id;
			}

			// Otherwise create a new entity
			EntityIndex newIndex = EntityIndex(entities.size());
			EntityID newID = createEntityID(newIndex, 0);
			entities.push_back({ newID, ComponentMask() });
			viewCache.clear();
			return newID;
		}

		void destroyEntity(EntityID entityID)
		{
			// Overwrite index with -1 and add to free list
			const EntityIndex index = getEntityIndex(entityID);
			const EntityVersion version = getEntityVersion(entityID);
			const EntityID newID = createEntityID(EntityIndex(-1), version);
			entities[index].id = newID;
			entities[index].mask.reset();
			freeEntities.push_back(index);
			viewCache.clear();
		}

		template<typename T>
		T* assign(EntityID entityID)
		{
			// Ensure entity still exists
			EntityIndex index = getEntityIndex(entityID);
			if (entities[index].id != entityID) return nullptr;

			// Get the ID of the component
			const unsigned int componentID = getID<T>();

			// Resize component pool list and create new pool if needed
			if (componentPools.size() <= componentID)
				componentPools.resize(componentID + 1, nullptr);
			if (componentPools[componentID] == nullptr)
				componentPools[componentID] = new ComponentPool(sizeof(T));

			// Create component then assign to entity mask
			T* component = new (componentPools[componentID]->get(index)) T();
			entities[index].mask.set(componentID);
			viewCache.clear();
			return component;
		}

		template<typename T>
		T* get(EntityID entityID, bool check = true)
		{
			// Ensure entity still exists
			EntityIndex index = getEntityIndex(entityID);
			if (check && entities[index].id != entityID) return nullptr;

			// Get the ID of the component
			const unsigned int componentID = getID<T>();

			// Ensure that entity has component
			if (check && !entities[index].mask.test(componentID)) return nullptr;

			// Return the specific component
			return static_cast<T*>(componentPools[componentID]->get(index));
		}

		template<typename T>
		void remove(EntityID entityID)
		{
			// Ensure entity still exists
			EntityIndex index = getEntityIndex(entityID);
			if (entities[index].id != entityID) return nullptr;

			// Get the ID of the component
			const unsigned int componentID = getID<T>();

			// Remove the component
			entities[index].mask.reset(componentID);
		}

		void log() const
		{
			std::cout << "-- Scene Information --" << std::endl;
			std::cout << "Entity Count: " << entities.size() << " / " << MAX_ENTITIES << std::endl;
			std::cout << "Component Count: " << MAX_COMPONENTS << std::endl;
			std::cout << std::endl;
		}
	};

	template<typename... ComponentTypes>
	std::vector<EntityID> getSceneView(Scene& scene)
	{
		const unsigned long long componentCount = sizeof...(ComponentTypes);
		const bool getAllEntities = componentCount == 0;

		// Create mask from component types
		ComponentMask mask;
		if (!getAllEntities)
		{
			const unsigned int componentIDs[] = { 0, getID<ComponentTypes>() ... };
			for (int i = 1; i < componentCount + 1; i++) mask.set(componentIDs[i]);
		}

		// Check if view is already cached
		if (scene.viewCache.count(mask.to_ulong()) > 0) return scene.viewCache[mask.to_ulong()];

		// Create view of entities with specified components
		std::vector<EntityID> entities;

		for (size_t i = 0; i < scene.entities.size(); i++)
		{
			if (isEntityValid(scene.entities[i].id)
				&& (getAllEntities || mask == (mask & scene.entities[i].mask)))
			{
				entities.emplace_back(scene.entities[i].id);
			}
		}

		scene.viewCache[mask.to_ulong()] = entities;
		return entities;
	}

	// ------------------- System ------------------- /

	namespace system
	{
		static ThreadPool threadPool;

		static void threadpoolProcess(std::function<void(std::vector<EntityID>)> process, std::vector<EntityID> entities)
		{
			// Function to split process into multiple sub functions
			auto processSplitter = [=](std::vector<EntityID> entities, size_t start, size_t end)
			{
				std::vector<EntityID> subEntities(entities.begin() + start, entities.begin() + end);
				return [=] { process(subEntities); };
			};

			// Process with multiple threads
			const size_t entityCount = entities.size();
			const size_t threadCount = threadPool.size();
			const size_t gap = entityCount / threadCount;
			std::vector<std::future<void>> results(threadCount);
			for (size_t i = 0; i < threadCount; i++)
			{
				int threadStart = i * gap;
				int threadEnd = static_cast<int>(std::min(threadStart + gap, entityCount));
				results[i] = threadPool.enqueue(processSplitter(entities, threadStart, threadEnd));
			}

			// Wait for all threads to finish
			for (auto&& result : results) result.get();
		}
	}
}
