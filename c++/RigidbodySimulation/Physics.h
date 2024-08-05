#pragma once

namespace Math
{
	class Float2
	{
	public:
		Float2() : x(0), y(0) {}
		Float2(float x, float y) : x(x), y(y) {}
		void operator+=(const Float2& other) { x += other.x; y += other.y; }
		void operator-=(const Float2& other) { x -= other.x; y -= other.y; }
		void operator*=(float scalar) { x *= scalar; y *= scalar; }
		void operator/=(float scalar) { x /= scalar; y /= scalar; }
		Float2 operator+(const Float2& other) const { return Float2(x + other.x, y + other.y); }
		Float2 operator-(const Float2& other) const { return Float2(x - other.x, y - other.y); }
		Float2 operator*(float scalar) const { return Float2(x * scalar, y * scalar); }
		Float2 operator/(float scalar) const { return Float2(x / scalar, y / scalar); }
		float Length() const { return sqrt(x * x + y * y); }
		float LengthSq() const { return x * x + y * y; }
		Float2 Normalized() const { return *this / Length(); }
		float Dot(const Float2& other) const { return x * other.x + y * other.y; }
		float Cross(const Float2& other) const { return x * other.y - y * other.x; }
		Float2 Perpendicular() const { return Float2(-y, x); }

		float x, y;
	};

	const float PI = 3.14159265;
}

namespace Physics
{
	namespace Utility
	{
		struct OverlapInfo
		{
			bool collided;
			float penetration;
			Math::Float2 normal;
		};

		OverlapInfo OverlapCircleCircle(
			Math::Float2 posA, float radiusA,
			Math::Float2 posB, float radiusB)
		{}

		OverlapInfo OverlapCirclePolygon(
			Math::Float2 posA, float radiusA,
			const std::vector<Math::Float2>& verticesB, float angleB)
		{}

		OverlapInfo OverlapPolygonPolygon(
			const std::vector<Math::Float2>& verticesA, float angleA,
			const std::vector<Math::Float2>& verticesB, float angleB)
		{}

		float CalculateAreaCircle(float radius)
		{
			return radius * radius * Math::PI;
		}

		float CalculateAreaPolygon(const std::vector<Math::Float2>& vertices)
		{
			return 2000;
		}

		float CalculateMomentOfInertiaCircle(float mass, float radius)
		{
			return 2000;
		}

		float CalculateMomentOfInertiaPolygon(float mass, const std::vector<Math::Float2>& vertices)
		{
			return 2000;
		}
	}

	struct Material
	{
		float restitution;
		float frictionDynamic;
		float frictionStatic;
		float momentOfInertia;
		float density;
	};

	struct Transform
	{
		Math::Float2 position;
		float angle;
	};

	class Collider
	{
	public:
		enum class Type { Circle, Polygon };

		Type type;

		union
		{
			struct { float radius; } Circle;
			struct { std::vector<Math::Float2> vertices } Polygon;
		};
	};

	class RigidBody
	{
	public:
		Material* material;
		Transform* transform;
		Collider* collider;
		float mass;
		Math::Float2 velocity;
		float angularVelocity;
		Math::Float2 externalForce;
		float externalTorque;

		RigidBody(Material* material, Collider* collider, Transform* transform = new Transform)
			: material(material), collider(collider), transform(transform),
			velocity(0, 0), angularVelocity(0), externalForce(0, 0), externalTorque(0)
		{}

		~RigidBody()
		{
			delete material;
			delete transform;
			delete collider;
		};

		struct CollisionInfo
		{
			RigidBody* bodyA;
			RigidBody* bodyB;
			Utility::OverlapInfo overlap;
		};

		class Simulation
		{
		public:
			RigidBody& AddBody(Material material, Collider collider, Transform transform = {})
			{
				this->bodies.push_back(RigidBody(material, collider, transform));
				return this->bodies.back();
			}

			void Step(float dt)
			{
				// Find collisions
				// Resolve impulse
				// Resolve position
			}

			std::vector<RigidBody>& GetBodies() { return bodies; }

		private:
			std::vector<RigidBody> bodies;
			std::vector<CollisionInfo> collisions;
		};
	}
