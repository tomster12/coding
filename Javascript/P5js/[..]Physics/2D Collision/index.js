
// #region - Driver

let SIM;
let IT;


function setup() {
  createCanvas(600, 600);

  // World 1
  SIM = new RigidbodySim(true);
  const s1 = Rigidbody.newSquare(SIM, false, 0.3, new Vector(250, 350), new Vector(100, 100));
  s1.posVel.iAdd({ x: 50, y: 0 });
  s1.rotVel += 1.2;
  const s2 = Rigidbody.newFunky(SIM, false, 0.3, new Vector(250, 250), new Vector(230, 45));
  s2.rotVel += 0.7;
  Rigidbody.newSquare(SIM, false, 0.3, new Vector(400, 350), new Vector(80, 80));
  Rigidbody.newSquare(SIM, false, 0.3, new Vector(300, 0), new Vector(18, 18));
  Rigidbody.newFunky(SIM, false, 0.3, new Vector(280, -30), new Vector(20, 20));
  Rigidbody.newSquare(SIM, true, 0.3, new Vector(300, 500), new Vector(500, 25));
  Rigidbody.newSquare(SIM, true, 0.3, new Vector(100, 300), new Vector(25, 500));
  Rigidbody.newSquare(SIM, true, 0.3, new Vector(500, 300), new Vector(25, 500));

  // World 2
  // SIM = new RigidbodySim(false);
  // const s1 = Rigidbody.newSquare(SIM, false, 1, new Vector(300, 200), new Vector(100, 100));
  // s1.posVel.y = 100;
  // Rigidbody.newSquare(SIM, true, 0.3, new Vector(300, 500), new Vector(250, 25));

  // World 3
  // SIM = new RigidbodySim(false);
  // const s1 = Rigidbody.newSquare(SIM, false, 1, new Vector(300, 200), new Vector(100, 100));
  // s1.posVel.y = 100;
  // Rigidbody.newSquare(SIM, false, 1, new Vector(300, 350), new Vector(100, 100));

  // Setup other variables
  IT = new Interactor();
  mousePos = new Vector(0, 0);
}

function draw() {
  background(0);
  SIM.draw();
  IT.draw();
}


mousePressed = () => IT.mousePressed();
mouseReleased = () => IT.mouseReleased();

// #endregion


class Interactor {

  static DRAG_FORCE = 300;


  constructor() {
    // Initialize variables
    this.mousePos = new Vector(0, 0);
    this.mouseClicked = false;
    this.mouseHeld = false;
    this.dragInfo = { isDragging: false, draggingRB: null, draggingOffsetAngle: null, draggingOffsetLength: null };
  }

  draw() {
    // Update variables
    this.mousePos = new Vector(mouseX, mouseY);

    // Handle RB interaction
    let hoveredRB;
    SIM.rigidbodys.forEach(rb => {

      // Calculate if hovered
      const hovered = Utility.checkPointInPoints(this.mousePos, rb.worldBounds, rb.edges).isOverlapping;
      if (hovered && !this.dragInfo.isDragging) {
        hoveredRB = rb;
        const sx = 200, sy = 90;
        const topLeft = this.mousePos.add({ x: -sx * 0.5, y: -sy * 1 });
        const f = num => floor(num * 100) / 100;

        stroke(255);
        fill(10, 100);
        line(rb.pos.x, rb.pos.y, this.mousePos.x, this.mousePos.y);
        rect(topLeft.x, topLeft.y, sx, sy);

        noStroke();
        fill(255);
        textAlign(LEFT, TOP);
        textSize(10);
        text("pos: ", topLeft.x + 10, topLeft.y + 10);
        text(f(rb.pos.x) + ", " + f(rb.pos.y), topLeft.x + 100, topLeft.y + 10);
        text("pos vel: ", topLeft.x + 10, topLeft.y + 20);
        text(f(rb.posVel.x) + ", " + f(rb.posVel.y), topLeft.x + 100, topLeft.y + 20);
        text("rot: ", topLeft.x + 10, topLeft.y + 30);
        text(f(rb.rot), topLeft.x + 100, topLeft.y + 30);
        text("rot vel: ", topLeft.x + 10, topLeft.y + 40);
        text(f(rb.rotVel), topLeft.x + 100, topLeft.y + 40);
        text("mass: ", topLeft.x + 10, topLeft.y + 50);
        text(f(rb.mass), topLeft.x + 100, topLeft.y + 50);
        text("inertia: ", topLeft.x + 10, topLeft.y + 60);
        text(f(rb.inertia), topLeft.x + 100, topLeft.y + 60);
      }
    });

    // Not dragging
    if (!this.dragInfo.isDragging) {

      // Start dragging
      if (hoveredRB != null && this.mouseClicked) {
        const dir = this.mousePos.sub(hoveredRB.pos);
        const angle = atan2(dir.y, dir.x) - hoveredRB.rot;
        const length = dir.getLength();
        this.dragInfo.isDragging = true;
        this.dragInfo.draggingRB = hoveredRB;
        this.dragInfo.draggingOffsetAngle = angle;
        this.dragInfo.draggingOffsetLength = length;
      }

    // Dragging
    } else {

      // Move object
      const angle = this.dragInfo.draggingOffsetAngle + this.dragInfo.draggingRB.rot;
      const pos = this.dragInfo.draggingRB.pos.add(new Vector(
        this.dragInfo.draggingOffsetLength * cos(angle),
        this.dragInfo.draggingOffsetLength * sin(angle)
      ));

      // Draw line
      stroke(255);
      noFill();
      line(pos.x, pos.y, this.mousePos.x, this.mousePos.y);

      // Apply focce
      const a = this.dragInfo.draggingRB;
      const dir = this.mousePos.sub(pos);
      a.posVel.iAdd(dir.mult(Interactor.DRAG_FORCE / a.mass));
      a.rotVel += pos.sub(a.pos).perp().dot(dir) * Interactor.DRAG_FORCE / a.inertia;
      
      // Stop dragging
      if (!this.mouseHeld) this.dragInfo.isDragging = false;
    }

    // Handle input
    this.mouseClicked = false;
  }


  mousePressed() {
    this.mouseHeld = true;
    this.mouseClicked = true;
  }

  mouseReleased() {
    this.mouseHeld = false;
    this.mouseClicked = false;
  }
}


class Vector {

  constructor(x_, y_) {
    this.x = x_;
    this.y = y_;
  }


  add = (other) => new Vector(this.x + other.x, this.y + other.y);
  sub = (other) => new Vector(this.x - other.x, this.y - other.y);
  mult = (val) => new Vector(this.x * val, this.y * val);

  iAdd(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  iSub(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  iMult(val) {
    this.x *= val;
    this.y *= val;
    return this;
  }
  
  perp = () => new Vector(-this.y, this.x);
  dot = (other) => this.x * other.x + this.y * other.y;
  cross = (other) =>  this.x * other.y - this.y * other.x;
  norm = () => {
    const dst = this.getLength();
    return new Vector(this.x / dst, this.y / dst);
  };


  getLengthSq = () => this.x * this.x + this.y * this.y;
  getLength = () => sqrt(this.getLengthSq());
  toString = () => "(" + this.x + ", " + this.y + ")";
  copy = () => new Vector(this.x, this.y);
}

class Utility {

  static calculateMass(bounds, density) {
    // Use density and area of triangles
    const w = bounds.b.x - bounds.a.x;
    const h = bounds.b.y - bounds.a.y;
    const m = density * w * h;
    return m;
  }

  static calculateInertia(bounds, mass) {
    // Use equation online for each triangle
    // Sum of (mass * perpRad^2) for each point
    const w = bounds.b.x - bounds.a.x;
    const h = bounds.b.y - bounds.a.y;
    return mass * (w * w + h * h) / 12.0;
  }

  static calculateBounds(points) {
    // Calculate min and max points
    let a = points[0].copy();
    let b = points[0].copy();
    for (let p of points) {
      a.x = min(a.x, p.x);
      a.y = min(a.y, p.y);
      b.x = max(b.x, p.x);
      b.y = max(b.y, p.y);
    }
    return { a, b };
  }


  static checkPointInPoints(a, bounds, edges) {
    // Detect overlap through intersections
    const b = bounds.b.copy().iAdd({ x: 1, y: 1 });
    const count = edges.reduce((count, e) => this.checkLineOnLine(a, b, e.a, e.b) ? count + 1 : count, 0);
    if (count % 2 == 1) {

      // Return info for closest edge
      return edges.reduce((acc, e, i) => {
        if (e.b.sub(e.a).perp().dot(a.sub(e.a)) <= 0) return acc;
        const p = this.closestPointOnLine(a, e.a, e.b);
        const dir = p.sub(a);
        const depth = dir.getLength();
        if (acc && acc.depth <= depth) return acc;
        return { isOverlapping: true, a: a.copy(), p: p, n: dir.norm(), depth: depth, edgeIndex: i };
      }, null);
    }
    
    // Return empty info
    else return { isOverlapping: false, p: null, n: null, depth: 0, edgeIndex: -1 };
  }

  static checkLineOnLine(a, b, c, d) {
    // Check line overlap (no colinearity checks)
    const ccw = (A,B,C) => (C.y-A.y) * (B.x-A.x) >= (B.y-A.y) * (C.x-A.x);
    return ccw(a, c, d) != ccw(b, c, d) && ccw(a, b, c) != ccw(a, b, d);
  }

  static closestPointOnLine(p, a, b) {
    // Calculate closest point on a line
    const dir = b.sub(a).norm();
    const v = p.sub(a);
    const d = v.dot(dir);
    return a.add(dir.iMult(d));
  }
}

class RigidbodySim {

  static GRAVITY = new Vector(0.0, 800);
  static SUB_FRAMES = 10.0;
  static POS_PCT = 0.9;
  static POS_SLOP = 0.02;
  static IMP_E = 0.4;


  constructor(hasGravity_) {
    this.rigidbodys = [];
    this.collisions = [];
    this.hasGravity = hasGravity_;
    this.dt = 0.0;
  }


  draw() {
    // Update physics and show
    this.dt = 1.0 / 60.0;
    this.stepPhysics(this.dt);
    this.drawRigidbodies();
  }

  drawRigidbodies() {
    // Update and show all rigidbodies
    for (const rb of this.rigidbodys) rb.update();
    for (const rb of this.rigidbodys) rb.show();
  }

  showCollisions() {
    // Draw collisions
    strokeWeight(2);
    stroke(100, 200, 100);
    noFill();
    this.collisions.forEach(c => {
      line(c.info.p.x, c.info.p.y, c.info.p.x + c.info.n.x * 50, c.info.p.y + c.info.n.y * 50);
      rect(c.info.p.x - 5, c.info.p.y - 5, 10, 10);
    });
    strokeWeight(1);
  }


  stepPhysics(dt) {
    // Split DT up and step forward
    for (let _ = 0; _ < RigidbodySim.SUB_FRAMES; _++) {
      this.stepDynamics(dt / RigidbodySim.SUB_FRAMES);
      this.detectCollisions();
      this.resolveCollisions();
    }
  }

  stepDynamics(dt) {
    this.rigidbodys.forEach(rb => {
      if (rb.isStatic) {
        // Cancel out dynamics
        rb.posVel.iMult(0);
        rb.rotVel *= 0;

      } else {
        // Apply gravity force
        if (this.hasGravity) rb.posVel.iAdd(RigidbodySim.GRAVITY.mult(dt));

        // Update pos / rot
        rb.pos.iAdd(rb.posVel.mult(dt));
        rb.rot += rb.rotVel * dt;
        rb.rot = (rb.rot + TWO_PI) % TWO_PI;

        // Update vertices
        rb.onPointsMoved();
      }
    });
  }

  detectCollisions() {
    // Main detection function
    const findCollisions = (rb1, rb2) => {

      // Check overlap of rb1 points inside rb2
      const rb2EdgeHits = new Array(rb2.edges.length).fill(null).map(_ => []);
      let rb1Collided = false;
      rb1.worldEdgePoints.forEach((p1, i) => {
        const info = Utility.checkPointInPoints(p1, rb2.worldBounds, rb2.edges);
        if (info.isOverlapping) {
          rb2EdgeHits[info.edgeIndex].push({ a: rb1, b: rb2, info, pointIndex: i });
          rb1Collided = true;
        }
      });

      // Process each collision against rb2 edges
      if (rb1Collided) {
        rb2EdgeHits.forEach((hits, i) => {

          // None / standard base cases
          if (hits.length == 0) return;
          if (hits.length == 1) { this.collisions.push(hits[0]); return; }

          // Average the collision points and add
          const a = hits[0].info.a;
          for (let i = 1; i < hits.length; i++) a.iAdd(hits[i].info.a);
          hits[0].info.a = a.iMult(1.0 / hits.length);
          hits[0].info.p = Utility.closestPointOnLine(a, rb2.edges[i].a, rb2.edges[i].b);
          const dir =  hits[0].info.p.sub(hits[0].info.a);
          hits[0].info.n = dir.norm();
          hits[0].info.depth = dir.getLength();
          this.collisions.push(hits[0]);
        });
      }
    };

    // Loop over and find all valid pairs
    this.collisions = [];
    for (let i = 0; i < this.rigidbodys.length - 1; i++) {
      for (let j = i + 1; j < this.rigidbodys.length; j++) {
        const rb1 = this.rigidbodys[i];
        const rb2 = this.rigidbodys[j];
        if (rb1.isStatic && rb2.isStatic) continue;
        findCollisions(rb1, rb2);
        findCollisions(rb2, rb1);
      }
    }
  }

  resolveCollisions() {
    this.collisions.forEach(c => {
      // Collate needed variables
      const e = RigidbodySim.IMP_E;
      const n = c.info.n;
      const m_a = c.a.mass;
      const m_b = c.b.mass;
      const I_a = c.a.inertia;
      const I_b = c.b.inertia;
      const mI_a = c.a.isStatic ? 0.0 : 1.0 / m_a;
      const mI_b = c.b.isStatic ? 0.0 : 1.0 / m_b;
      const II_a = c.a.isStatic ? 0.0 : 1.0 / I_a;
      const II_b = c.b.isStatic ? 0.0 : 1.0 / I_b;

      // Calculate collision variables
      const rP_a = c.info.a.sub(c.a.pos);
      const rP_b = c.info.a.sub(c.b.pos);
      const rPT_a = rP_a.perp();
      const rPT_b = rP_b.perp();
      const vP_a = c.a.posVel.add(rPT_a.mult(c.a.rotVel));
      const vP_b = c.b.posVel.add(rPT_b.mult(c.b.rotVel));
      const vRP = vP_b.sub(vP_a);
      const vRN = vRP.dot(n);
      if (vRN < 0) return;

      // ------------------
      // Resolve impulses
      // ------------------
      const j = -(1 + e) * vRN / (mI_a + mI_b + pow(rP_a.cross(n), 2) * II_a + pow(rP_b.cross(n), 2) * II_b);
      const jn_a = n.mult(-j);
      const jn_b = n.mult(j);
      c.a.deltaPosVel.iAdd(jn_a.mult(mI_a));
      c.b.deltaPosVel.iAdd(jn_b.mult(mI_b));
      c.a.deltaRotVel += rPT_a.dot(jn_a) * II_a;
      c.b.deltaRotVel += rPT_b.dot(jn_b) * II_b;

      // ------------------
      // Resolve positions
      // ------------------
      const amount = RigidbodySim.POS_PCT * max(c.info.depth - RigidbodySim.POS_SLOP, 0.0) / (mI_a + mI_b);
      const correction = c.info.n.mult(amount);
      if (!c.a.isStatic) c.a.deltaPos.iAdd(correction.mult(mI_a));
      if (!c.b.isStatic) c.b.deltaPos.iAdd(correction.mult(-mI_b));
    });
    
    // Apply and empty deltas
    this.rigidbodys.forEach(cl => {

      // Add deltas
      if (!cl.isStatic) {
        cl.pos.iAdd(cl.deltaPos);
        cl.rot += cl.deltaRot;
        cl.posVel.iAdd(cl.deltaPosVel);
        cl.rotVel += cl.deltaRotVel;
        cl.onPointsMoved();
      }
  
      // Empty deltas
      cl.deltaPos.iMult(0);
      cl.deltaPosVel.iMult(0);
      cl.deltaRot *= 0;
      cl.deltaRotVel *= 0;
    });
  }


  addRigidbody = (cl) => this.rigidbodys.push(cl);
}

class Rigidbody {

  constructor(world_, isStatic_, density_) {
    // Add to world
    this.world = world_;
    this.world.addRigidbody(this);

    // Initialize physics
    this.isStatic = isStatic_;
    this.density = density_;

    this.pos = new Vector(0, 0);
    this.posVel = new Vector(0, 0);
    this.rot = 0;
    this.rotVel = 0;

    this.deltaPos = new Vector(0, 0);
    this.deltaPosVel = new Vector(0, 0);
    this.deltaRot = 0;
    this.deltaRotVel = 0;

    // Initialize mesh
    this.localEdgePoints = [];
    this.worldEdgePoints = [];
    this.localBounds = null;
    this.worldBounds = null;
    this.edges = [];
  }

  static newSquare(world_, isStatic_, density_, pos_, size) {
    // Setup points
    const WOBBLINESS = 0.15;
    const localEdgePoints = [];
    localEdgePoints.push(new Vector(-size.x * 0.5, -size.y * 0.5));
    localEdgePoints.push(new Vector(size.x * 0.5, -size.y * 0.5));
    localEdgePoints.push(new Vector(size.x * 0.5, size.y * 0.5));
    localEdgePoints.push(new Vector(-size.x * 0.5, size.y * 0.5));

    // Creatae and return rigidbody
    const newRigidbody = new Rigidbody(world_, isStatic_, density_);
    newRigidbody.pos = pos_;
    newRigidbody.setPoints(localEdgePoints);
    return newRigidbody;
  }

  static newFunky(world_, isStatic_, density_, pos_, size) {
      // Setup points
      const WOBBLINESS = 0.15;
      const localEdgePoints = [];
      localEdgePoints.push(new Vector(0, -size.y * 0.5));
      localEdgePoints.push(new Vector(size.x * 0.5, -size.y * 0.5));
      localEdgePoints.push(new Vector(size.x * 0.3, 0));
      localEdgePoints.push(new Vector(size.x * 0.5, size.y * 0.2));
      localEdgePoints.push(new Vector(-size.x * 0.2, size.y * 0.35));
      localEdgePoints.push(new Vector(-size.x * 0.3, 0));
  
      // Creatae and return rigidbody
      const newRigidbody = new Rigidbody(world_, isStatic_, density_);
      newRigidbody.pos = pos_;
      newRigidbody.setPoints(localEdgePoints);
      return newRigidbody;
  }


  update() {  
  }

  show() {
    // Draw outline
    stroke(255);
    noFill();
    beginShape();
    this.worldEdgePoints.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);
  }


  setPoints(newPoints) {
    // Set points and update
    this.localEdgePoints = newPoints;
    this.onShapeChanged();
  }

  onPointsMoved() {
    // Setup rotation matrix
    const rotMat = [
      [cos(this.rot), -sin(this.rot)],
      [sin(this.rot),  cos(this.rot)] ];
    
    // Update world points
    // w = p + R • l
    for (let i = 0; i < this.localEdgePoints.length; i++) {
      const p = this.localEdgePoints[i];
      this.worldEdgePoints[i].x = this.pos.x + rotMat[0][0] * p.x + rotMat[0][1] * p.y;
      this.worldEdgePoints[i].y = this.pos.y + rotMat[1][0] * p.x + rotMat[1][1] * p.y;
    }

    // Update world point bounds
    this.worldBounds = Utility.calculateBounds(this.worldEdgePoints);
  }

  onShapeChanged() {
    // Ensure world point array is good
    if (this.worldEdgePoints.length != this.localEdgePoints.length) {
      this.worldEdgePoints = [];
      for (let _ = 0; _ < this.localEdgePoints.length; _++) this.worldEdgePoints.push(new Vector(0, 0));
    }

    // Recalculate edges with world point references
    this.edges = this.worldEdgePoints.reduce((edges, _, i) => [...edges, {
      a: this.worldEdgePoints[i],
      b: this.worldEdgePoints[(i + 1) % this.worldEdgePoints.length]
    }], []);

    // Recalculate physical attributes
    this.localBounds = Utility.calculateBounds(this.localEdgePoints);
    this.mass = Utility.calculateMass(this.localBounds, this.density);
    this.inertia = Utility.calculateInertia(this.localBounds, this.mass);

    // Reculate world points and bounds
    this.onPointsMoved();
  }
}
