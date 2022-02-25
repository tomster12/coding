
class RigidWorld {

  // Declare variables
  private ArrayList<RigidBody> bodies;
  private ArrayList<Collision> collisions;
  private ArrayList<Resolver> resolvers;


  RigidWorld() {
    // Initialize variables
    bodies = new ArrayList<RigidBody>();
    collisions = new ArrayList<Collision>();
    resolvers = new ArrayList<Resolver>();
  }


  public RigidBody addBody(RigidBody body) { bodies.add(body); return body; }

  public Resolver addResolver(Resolver resolver) { resolvers.add(resolver); return resolver; }


  public void step(float dt) {
    // Step bodies and handle collisions
    stepDynamics(dt);
    detectCollisions(dt);
    resolveCollisions(dt);
  }


  private void stepDynamics(float dt) {
    // Step all dynamic bodies
    for (RigidBody body : bodies) {
      if (!body.isKinematic) {

        // Apply gravity
        body.velocity.iadd(new Float2(0, 2));

        // Update dynamics
        body.velocity.iadd(body.externalForce.mult(1 / body.mass));
        body.transform.position.iadd(body.velocity.mult(dt));
        body.transform.rotation += body.rotVelocity * dt;
        body.externalForce.imult(0);
      }
    }
  }


  private void detectCollisions(float dt) {
    // Reset collision info
    collisions.clear();
    for (RigidBody body : bodies) body.collider.collided = false;

    // Detect collisions between all pairs of non-kinematic bodies
    for (RigidBody bodyA : bodies) {
      for (RigidBody bodyB : bodies) {
        if (bodyA == bodyB) break;
        if (bodyA.isKinematic && bodyB.isKinematic) continue;

        // Check collisions between bodyA and bodyB
        CollisionInfo info = bodyA.collider.checkCollision(bodyA.transform, bodyB.collider, bodyB.transform);
        if (info.hasCollision) collisions.add(new Collision(bodyA, bodyB, info));
      }
    }
  }


  private void resolveCollisions(float dt) {
    // Run resolvers over collisions
    for (Resolver resolver : resolvers) resolver.resolve(collisions, dt);
  }


  public void show() {
    // Show all rigid bodies
    for (RigidBody body : bodies) body.collider.show(body.transform);
  }
}


class RigidBody {

  // Declare variables
  public Transform transform;
  public Collider collider;

  public boolean isKinematic;
  public float mass;
  public float momInertia;
  public float restitution;
  public float dynamicFriction;
  public float staticFriction;

  public Float2 velocity;
  public float rotVelocity;
  public Float2 externalForce;


  RigidBody(Transform transform_, Collider collider_) { this(transform_, collider_, false); }

  RigidBody(Transform transform_, Collider collider_, boolean isKinematic_) {
    // Initialize variables
    transform = transform_;
    collider = collider_;

    isKinematic = isKinematic_;
    mass = collider.getArea(transform);
    momInertia = collider.getArea(transform) / 2000;
    restitution = 0.45;
    dynamicFriction = 0.1;
    staticFriction = 0.1;

    velocity = new Float2(0, 0);
    rotVelocity = 0;
    externalForce = new Float2(0, 0);
  }
}