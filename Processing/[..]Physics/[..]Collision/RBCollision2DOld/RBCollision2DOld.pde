
// For all functions try to keep PVectors out of parameters to increase speed
// Exceptions:
//    PVector[] lineOverlap(PVector[] line)

//      TODONE
// Calculate vertices based on offsets and angle
// Able to create / drag rigid bodies
// Function to detect overlap between rigidbodies
// Fully read through article http://chrishecker.com/Rigid_body_dynamics
// Subdivision of time to collide more precisely
// Add toShow to rigidbody

//      TODO
// Fix jittering caused by incorrect subdivision
// Fix case of subdivision collision where edges align
// Calculate mass of object
// Calculate moment of inertia around centre
// Redo using own Double2 class

// CURRENTLY DEBUG
// After collisions it is moving the point in which it collides backwards
// rather than removing it completely.
// This is leading to the subdivision moving backwards out of the
// current time section as it is chasing the collision which is Moving
// itself backwards.
// Could be collision calculation or subdivision


// #region - Setup

 // Variables
final float pixelsPerMetre = 100;
float totalTime;
RigidBodyScene globalRbs;

RigidBody dragRB;
float dragPosDirAngle;
float dragPosDirMag;
PVector createPos;


void setup() { // PApplet - Setup processing functions
  size(600, 600);
  stroke(255);
  noFill();
  setupVariables();
}


void setupVariables() { // PApplet - Setup variables
  totalTime = 0;
  globalRbs = new RigidBodyScene(new PVector(20, 20), new PVector(width - 40, height - 40), 10);
  new RigidBody(globalRbs, false, true, new PVector[] {
    new PVector(-10, -10),
    new PVector(-10, 10),
    new PVector(10, 10),
    new PVector(10, -10)
  }, new PVector(width/2, height/2), 0);
}

// #endregion


// #region - Main

void draw() { // PApplet - Draw to the screen
  background(0);
  globalRbs.update();
  globalRbs.show();
  showInteract();
}


void showInteract() { // PApplet - Show drag / create interactions
  if (createPos != null) { // Show create
    PVector mousePos = getMousePos();
    PVector centre = PVector.mult(PVector.add(mousePos, createPos), 0.5);
    PVector[] vertices = new PVector[] {
      createPos,
      PVector.add(centre, vPerp(PVector.sub(createPos, centre))),
      mousePos,
      PVector.add(centre, vPerp(PVector.sub(mousePos, centre))),
    };
    quad(
      vertices[0].x, vertices[0].y,
      vertices[1].x, vertices[1].y,
      vertices[2].x, vertices[2].y,
      vertices[3].x, vertices[3].y
    );

  } else if (dragRB != null) { // Show drag
    PVector dragDir = new PVector(
      dragPosDirMag * cos(dragPosDirAngle + dragRB.rot),
      dragPosDirMag * sin(dragPosDirAngle + dragRB.rot)
    );
    line(mouseX, mouseY, dragRB.pos.x + dragDir.x, dragRB.pos.y + dragDir.y);
  }
}

// #endregion


// #region - Other

float vDot(PVector vec0, PVector vec1) { // Get dot product of 2 vectors
  return vec0.x * vec1.x + vec0.y * vec1.y;
}


PVector vPerp(PVector vec) { // Get perpendicular vector of given vector
  return new PVector(-vec.y, vec.x);
}


void mousePressed() { // PApplet - Called when the mouse is pressed

  // Find current interacted RigidBodyScene
  PVector mousePos = getMousePos();
  RigidBody rbOntop = globalRbs.rbOntop(mouseX, mouseY);

  // Trying to drag a RigidBody
  if (rbOntop != null) {
    PVector dragDir = PVector.sub(mousePos, rbOntop.pos);
    dragRB = rbOntop;
    dragPosDirMag = dragDir.mag();
    dragPosDirAngle = dragDir.heading() - dragRB.rot;

  // Trying to create a RigidBody
  } else {
    createPos = mousePos;
  }
}


void mouseReleased() { // PApplet - Called when the mouse is released

  //  Dragging a RigidBody
  if (dragRB != null) {
    PVector dragPos = PVector.add(dragRB.pos, new PVector(
      dragPosDirMag * cos(dragPosDirAngle + dragRB.rot),
      dragPosDirMag * sin(dragPosDirAngle + dragRB.rot)
    ));
    PVector dragForce = PVector.sub(getMousePos(), dragPos);
    dragRB.applyImpulseToPoint(dragPos, dragForce);
    dragRB = null;
    dragPosDirMag = 0;
    dragPosDirAngle = 0;

  // Create a RigidBody
  } else if (createPos != null) {
    PVector mousePos = getMousePos();
    PVector centre = PVector.mult(PVector.add(mousePos, createPos), 0.5);
    new RigidBody(globalRbs, true, true, new PVector[] {
      PVector.sub(createPos, centre),
      vPerp(PVector.sub(mousePos, centre)),
      PVector.sub(mousePos, centre),
      vPerp(PVector.sub(createPos, centre))
    }, centre, 0);
    createPos = null;
  }
}


PVector getMousePos() { // PApplet - Get PVector of mouse position
  return new PVector(mouseX, mouseY);
}

// #endregion


// Stores rigidBodies and allows them to collide
class RigidBodyScene {
  // #region - Setup

  final int updatesPerFrame; // Config variables

  ArrayList<RigidBody> rigidBodies; // Main variables
  PVector borderPos;
  PVector borderSize;
  float borderWidth;


  RigidBodyScene(PVector borderPos_, PVector borderSize_, float borderWidth_) { // Standard constructor
    updatesPerFrame = 20;

    rigidBodies = new ArrayList<RigidBody>();
    borderPos = borderPos_;
    borderSize = borderSize_;
    borderWidth = borderWidth_;

    new RigidBody(this, false, true, new PVector[] { // Setup borders
      new PVector(-borderWidth/2, -(borderSize.y+borderWidth)/2),
      new PVector(-borderWidth/2, (borderSize.y+borderWidth)/2),
      new PVector(borderWidth/2, (borderSize.y+borderWidth)/2),
      new PVector(borderWidth/2, -(borderSize.y+borderWidth)/2),
    }, new PVector(borderPos.x-borderWidth/2, borderPos.y+(borderSize.y+borderWidth)/2), 0);
    new RigidBody(this, false, true, new PVector[] {
      new PVector(-(borderSize.x+borderWidth)/2, -borderWidth/2),
      new PVector(-(borderSize.x+borderWidth)/2, borderWidth/2),
      new PVector((borderSize.x+borderWidth)/2, borderWidth/2),
      new PVector((borderSize.x+borderWidth)/2, -borderWidth/2),
    }, new PVector(borderPos.x-borderWidth+(borderSize.x+borderWidth)/2, borderPos.y-borderWidth/2), 0);
    new RigidBody(this, false, true, new PVector[] {
      new PVector(-borderWidth/2, -(borderSize.y+borderWidth)/2),
      new PVector(-borderWidth/2, (borderSize.y+borderWidth)/2),
      new PVector(borderWidth/2, (borderSize.y+borderWidth)/2),
      new PVector(borderWidth/2, -(borderSize.y+borderWidth)/2),
    }, new PVector(borderPos.x+borderSize.x+borderWidth/2, borderPos.y-borderWidth+(borderSize.y+borderWidth)/2), 0);
    new RigidBody(this, false, true, new PVector[] {
      new PVector(-(borderSize.x+borderWidth)/2, -borderWidth/2),
      new PVector(-(borderSize.x+borderWidth)/2, borderWidth/2),
      new PVector((borderSize.x+borderWidth)/2, borderWidth/2),
      new PVector((borderSize.x+borderWidth)/2, -borderWidth/2),
    }, new PVector(borderPos.x+(borderSize.x+borderWidth)/2, borderPos.y+borderSize.y+borderWidth/2), 0);
  }

  // #endregion


  // #region - Called

  void update() { // Called from PApplet draw
    rbProgressTime(1.0 / (frameRate * updatesPerFrame));
  }

  void show() { // Called from PApplet draw
    rbShow();
  }

  // #endregion


  // #region - RigidBody Functions


  // Collision et 3-4
  // Back to 3 - find none
  // Forward to 4
  // Update variables and collide


  void rbProgressTime(float dt) {
    // Handle physics on all rigidbodies
    for (int i = 0; i < updatesPerFrame; i++) {
      float currentDT = 0;
      float et = dt / 10.0;
      boolean collision = false;
      if (rbCheckCollisions()) {println("Error 0"); noLoop(); return;}


      // Time to progress or collision to handle
      while (collision || currentDT != dt) {

        // Progress to max and check collisions
        rbMovement(dt - currentDT); currentDT += (dt - currentDT);
        collision = rbCheckCollisions();


        // Handle the current collision
        if (collision) {

          // Subdivide backwards until found collision
          while (collision) {
            if (currentDT < 0) {println("Error 1"); noLoop(); return;}
            rbMovement(-et); currentDT -= et;
            collision = rbCheckCollisions();
            if (!collision) {
              rbMovement(et); currentDT += et;
            }
          }

          // Resolve the current collision
          rbCheckCollisions();
          rbUpdateCollisions();
        }
      }

      // Update total time
      totalTime += dt;
    }
  }


  void rbShow() { // Show all rigidBodies
    for (RigidBody rb : rigidBodies) rb.show();
  }


  void rbMovement(float dt) { // Update physics of rigidbodies
    for (RigidBody rb : rigidBodies)
      rb.updateMovement(dt);
  }


  boolean rbCheckCollisions() { // Check all rigidBodies to see if there is collision
    boolean collision = false;
    for (RigidBody rb : rigidBodies)
      if (rb.checkCollision())
        collision = true;
    return collision;
  }


  void rbUpdateCollisions() { // Update collisions on all rigidbodies
    for (RigidBody rb : rigidBodies)
      rb.updateCollision();
  }


  void rbAdd(RigidBody rb) { // Add a rigidBody
    rigidBodies.add(rb);
  }


  RigidBody rbOntop(float px, float py) { // Get rigidBody underneath point
    for (RigidBody rb : rigidBodies)
      if (rb.pointOverlap(px, py))
        return rb;
    return null;
  }

  // #endregion
}


// rigidBody that is managed by a rigidBodyScene
class RigidBody {
  // #region - Setup

  RigidBodyScene rbs; // Main variables
  boolean isKinematic;
  boolean isVisible;
  PVector[] vertexOffsets;
  PVector[] vertices;

  float mass; // Constant variables
  float momInertPos;

  PVector pos; // Kinematic variables
  PVector posVel;
  float rot;
  float rotVel;
  RigidBody toCollideRB;
  PVector[] toCollideOverlapInfo;


  RigidBody(  // Standard constructor
    RigidBodyScene rbs_, boolean isKinematic_, boolean isVisible_, PVector[] vertexOffsets_,
    PVector pos_, float rot_) {

    rbs = rbs_;
    isKinematic = isKinematic_;
    isVisible = isVisible_;
    vertexOffsets = vertexOffsets_;
    vertices = new PVector[4];

    mass = calculateMass();
    momInertPos = calculateMomInertPos();

    pos = pos_;
    posVel = new PVector(0, 0);
    rot = rot_;
    rotVel = 0;
    toCollideRB = null;
    toCollideOverlapInfo = null;

    rbs.rbAdd(this);
    calculateVertices();
  }

  // #endregion


  // #region - Called

  void updateMovement(float dt) { // Move based on velocities and accelerations
    if (isKinematic) {
      pos.add(PVector.mult(posVel, dt));
      rot += (rotVel * dt);
    }
    calculateVertices();
  }


  boolean checkCollision() { // Check if this rigidBody is colliding with another
    toCollideRB = null;
    toCollideOverlapInfo = null;
    for (RigidBody rbo : rbs.rigidBodies) {
      if (rbo != this && (rbo.isKinematic || isKinematic)) {
        PVector[] overlapInfo = rigidBodyOverlap(rbo);
        if (overlapInfo != null) {
          toCollideRB = rbo;
          toCollideOverlapInfo = overlapInfo;
          return true;
        }
      }
    }
    return false;
  }


  void updateCollision() { // Check for collision then collide using an impulse
    if (toCollideRB != null)
      collide(toCollideRB, toCollideOverlapInfo);
  }


  void show() { // Show at position with rotation and size
    if (isVisible) {
      beginShape();
      for (PVector vtx : vertices)
      vertex(vtx.x, vtx.y);
      endShape(CLOSE);
    }
  }

  // #endregion


  // #region - Physics

  void applyImpulseToPoint(PVector point, PVector jn) { // Apply an impulse
    // jn = mv - mu
    // posAcc += (jn) / mass;
    // rotAcc += (jn • rAP^T) / momInert;
    posVel.add(jn.mult(1.0 / mass));
    rotVel += vDot(vPerp(PVector.sub(point, pos)), jn) / momInertPos;
  }


  float calculateMass() { // Calculate the mass
    // Split into triangles and get mass using equations
    return 5;
  }


  float calculateMomInertPos() { // Calculate the moment of inertia around the pos
    // Sum of (mass * perpRad^2) for each point
    return 5000;
  }


  void calculateVertices() { // Calculate the position of each vertex
    // x' = xcosθ - ysinθ
    // y' = xsinθ + ycosθ
    for (int i = 0; i < vertexOffsets.length; i++) {
      vertices[i] = new PVector(
        pos.x + (vertexOffsets[i].x * cos(rot) - vertexOffsets[i].y * sin(rot)),
        pos.y + (vertexOffsets[i].x * sin(rot) + vertexOffsets[i].y * cos(rot))
      );
    }
  }


  void collide(RigidBody rbo, PVector[] overlapInfo) { // Collide with another rigidBody
    // Need to apply a continuous change instantly
    // Force over time in an infinitely small amount of Time
    // Use impulse = mv - mu = ft
    // Apply the impulse to a point
    // Divided by mass and added will end with v
    // Imperfect subidvision means this needs to place boxes in position afterwards

    if (isKinematic) {
      // Calculate necessary variables
      float cor = 1;
      PVector p = overlapInfo[0];
      PVector n = overlapInfo[1];
      PVector diff = overlapInfo[2];
      PVector vecAPT = vPerp(PVector.sub(p, pos));
      PVector vecBPT = vPerp(PVector.sub(p, rbo.pos));
      PVector velAtPointAP = PVector.add(posVel, PVector.mult(vecAPT, rotVel));
      PVector velAtPointBP = PVector.add(rbo.posVel, PVector.mult(vecBPT, rbo.rotVel));
      PVector velAB = PVector.sub(velAtPointBP, velAtPointAP);
      float massA = mass;
      float massB = rbo.mass;
      float inertA = momInertPos;
      float inertB = rbo.momInertPos;
      float j = 0;

      // Other is kinematic (standard collision)
      if (rbo.isKinematic) {
        j = (-(1 + cor) * vDot(velAB, n))
        / (vDot(n, PVector.mult(n, 1.0 / massA + 1.0 / massB))
          + (vDot(vecAPT, n) * vDot(vecAPT, n)) / inertA
          + (vDot(vecBPT, n) * vDot(vecBPT, n)) / inertB);

      // Other is not kinematic (other has infinite mass)
      } else {
        j = (-(1 + cor) * vDot(velAB, n))
        / (vDot(n, PVector.mult(n, 1.0 / massA))
          + (vDot(vecAPT, n) * vDot(vecAPT, n)) / inertA);
      }

      // Act on collision
      applyImpulseToPoint(p, PVector.mult(n, -j));
      pos.sub(diff);
      println("Colliding along " + n.x + ", " + n.y + " with j " + j + " and readjustment of " + -diff.x + ", " + -diff.y);
    }
  }

  // #endregion


  // #region - Overlap

  boolean pointOverlap(float px, float py) { // Returns whether a point is ontop
    for (int i = 0; i <= vertexOffsets.length; i++) {
      int vtx0 = (i) % vertexOffsets.length;
      int vtx1 = (i+1) % vertexOffsets.length;
      PVector dir0 = vPerp(PVector.sub(vertices[vtx1], vertices[vtx0]));
      PVector dir1 = PVector.sub(new PVector(px, py), vertices[vtx0]);
      if (vDot(dir0, dir1) >= 0)
        return false;
    }
    return true;
  }


  PVector[] lineOverlap(PVector[] line) { // Returns the edge a line is ontop of
    for (int count = 0; count <= vertexOffsets.length; count++) {
      int vtx0 = (count) % vertexOffsets.length;
      int vtx1 = (count+1) % vertexOffsets.length;
      float s1dx, s1dy, s2dx, s2dy;
      s1dx = vertices[vtx1].x - vertices[vtx0].x;
      s1dy = vertices[vtx1].y - vertices[vtx0].y;
      s2dx = line[1].x - line[0].x;
      s2dy = line[1].y - line[0].y;
      float s, t;
      s = (-s1dy * (vertices[vtx0].x - line[0].x) + s1dx * (vertices[vtx0].y - line[0].y))
        / (-s2dx * s1dy + s1dx * s2dy);
      t = ( s2dx * (vertices[vtx0].y - line[0].y) - s2dy * (vertices[vtx0].x - line[0].x))
        / (-s2dx * s1dy + s1dx * s2dy);
      if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        PVector sPointVec = new PVector(s2dx * (1 - s), s2dy * (1 - s));
        return new PVector[] {vertices[vtx0], vertices[vtx1], sPointVec};
      }
    }
    return null;
  }


  PVector[] rigidBodyOverlap(RigidBody rbo) { // Check if rigidBody overlap

    // Check each vertex of this shape for overlap
    for (PVector vtx : vertices) {
      if (rbo.pointOverlap(vtx.x, vtx.y)) {

        // If There is overlap find the edge
        PVector[] overlappedEdge = rbo.lineOverlap(new PVector[] {pos, vtx});
        if (overlappedEdge != null) {

          // Return the normal and point of overlap
          PVector norm = vPerp(PVector.sub(overlappedEdge[1], overlappedEdge[0]));
          PVector edgeToVertex = overlappedEdge[2];
          return new PVector[] {vtx, norm, edgeToVertex};
        }
      }
    }

    // Check each vertex of this shape for overlap
    for (PVector vtx : rbo.vertices) {
      if (pointOverlap(vtx.x, vtx.y)) {

        // If There is overlap find the edge
        PVector[] overlappedEdge = lineOverlap(new PVector[] {rbo.pos, vtx});
        if (overlappedEdge != null) {

          // Return the normal and point of overlap
          PVector norm = vPerp(PVector.sub(overlappedEdge[1], overlappedEdge[0]));
          PVector edgeToVertex = overlappedEdge[2];
          return new PVector[] {vtx, norm, edgeToVertex};
        }
      }
    }

    return null;
  }

  // #endregion
}
