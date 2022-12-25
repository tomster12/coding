
// TODO:
// [./] - Move Utility funcs to checkCollision() on collider
// [./] - Triangulation of meshes with Ear clipping
// [  ] - Collision with triangles instead
// [  ] - Collision checks based on AABB, maybe quad tree


// #region - Driver

let SIM;
let IT;


function setup() {
  createCanvas(600, 600);

  // World 1 - Bucket
  SIM = new RigidbodySim(true);
  const s1 = Rigidbody.createSquare(SIM, false, 0.3, new Vector(250, 350), new Vector(100, 100));
  s1.posVel.iAdd({ x: 50, y: 0 });
  s1.rotVel += 1.2;
  const s2 = Rigidbody.createFunky(SIM, false, 0.3, new Vector(250, 250), new Vector(230, 45));
  s2.rotVel += 0.7;
  Rigidbody.createSquare(SIM, false, 0.3, new Vector(400, 350), new Vector(80, 80));
  Rigidbody.createSquare(SIM, false, 0.3, new Vector(300, 0), new Vector(18, 18));
  Rigidbody.createFunky(SIM, false, 0.3, new Vector(280, -30), new Vector(20, 20));
  Rigidbody.createSquare(SIM, true, 0.3, new Vector(300, 500), new Vector(500, 25));
  Rigidbody.createSquare(SIM, true, 0.3, new Vector(100, 300), new Vector(25, 500));
  Rigidbody.createSquare(SIM, true, 0.3, new Vector(500, 300), new Vector(25, 500));

  // World 2 - Simple collision ground
  // SIM = new RigidbodySim(false);
  // const s1 = Rigidbody.createSquare(SIM, false, 1, new Vector(300, 200), new Vector(100, 100));
  // s1.posVel.y = 100;
  // Rigidbody.createSquare(SIM, true, 0.3, new Vector(300, 500), new Vector(250, 25));

  // World 3 - Simple collision 2 bodies
  // SIM = new Rsape();

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
      const hovered = Utility.checkPointOverlap(this.mousePos, rb).isOverlapping;
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

  static calculateAABB(points) {
    // Calculate min and max points
    let ax = points[0].x;
    let ay = points[0].y;
    let bx = points[0].x;
    let by = points[0].y;
    points.forEach(p => {
      ax = min(ax, p.x);
      ay = min(ay, p.y);
      bx = max(bx, p.x);
      by = max(by, p.y);
    });
    return { a: new Vector(ax, ay), b: new Vector(bx, by) };
  }

  static checkAABBOverlap(a, b) {
    // Check AABB overlap
    const d1x = b.a.x - a.b.x;
    const d1y = b.a.y - a.b.y;
    const d2x = a.a.x - b.b.x;
    const d2y = a.a.y - b.b.y;
    if (d1x > 0.0 || d1y > 0.0) return false;
    if (d2x > 0.0 || d2y > 0.0) return false;
    return true;
  }

  static checkLineOnLine(a, b, c, d) {
    // Check line overlap (no colinearity checks)
    const ccw = (A,B,C) => (C.y-A.y) * (B.x-A.x) >= (B.y-A.y) * (C.x-A.x);
    return ccw(a, c, d) != ccw(b, c, d) && ccw(a, b, c) != ccw(a, b, d);
  }

  static getClosestPointOnLine(p, a, b) {
    // Calculate closest point on a line
    const dir = b.sub(a).norm();
    const v = p.sub(a);
    const d = v.dot(dir);
    return a.add(dir.iMult(d));
  }


  static translatePoint(a, pos, rot) {
    // Translate a point with position and rotation
    return new Vector(
      pos.x + rot[0][0] * a.x + rot[0][1] * a.y,
      pos.y + rot[1][0] * a.x + rot[1][1] * a.y
    );
  }

  static triangulate(points) {
    // Triangulate a simple polygon
    let triangles = [];
    let currentPoints = points.map((_, i) => i);
    while (currentPoints.length > 3) {

      // Find first ear available
      let i, i1, i2, i3;
      for (i = 0; i < currentPoints.length; i++) {
        i1 = currentPoints[i];
        i2 = currentPoints[(i + 1) % currentPoints.length];
        i3 = currentPoints[(i + 2) % currentPoints.length];
        const a = points[i2].sub(points[i1]);
        const b = points[i3].sub(points[i1]);
        if (a.perp().dot(b) > 0) break;
      }

      // Generate triangle and remove point
      triangles.push([ i1, i2, i3 ]);
      currentPoints.splice((i + 1) % currentPoints.length, 1);
    }

    // Create last triangle and return
    triangles.push([ currentPoints[0], currentPoints[1], currentPoints[2] ]);
    return triangles;
  } 


  static calculateMass(rb) {
    // Use density and area of triangles
    const w = rb.localAABB.b.x - rb.localAABB.a.x;
    const h = rb.localAABB.b.y - rb.localAABB.a.y;
    const m = rb.density * w * h;
    return m;
  }

  static calculateInertia(rb) {
    // Use equation online for each triangle
    // Sum of (mass * perpRad^2) for each point
    const w = rb.localAABB.b.x - rb.localAABB.a.x;
    const h = rb.localAABB.b.y - rb.localAABB.a.y;
    return rb.mass * (w * w + h * h) / 12.0;
  }

  // static checkCollision(rb1, rb2) {
  //   console.log(" ");
  //   console.log("Checking:")
  //   rb1.triangles.forEach(t => console.log(t));
  //   rb1.worldVertices.forEach(v => console.log(v.toString()));
  
  //   console.log(" ");
  //   console.log("Against:")
  //   rb2.triangles.forEach(t => console.log(t));
  //   rb2.worldVertices.forEach(v => console.log(v.toString()));

  //   console.log(" ");
  //   const aabbOverlap = Utility.checkAABBOverlap(rb1.worldAABB, rb2.worldAABB);
  //   console.log("\nAABB Overlap: " + aabbOverlap);

  //   noLoop();
  //   return [];
  // }

  static checkCollision(rb1, rb2) {
    let collisions = [];

    // Check overlap of rbA points inside rbB
    const check = (rbA, rbB) => {
      const edgeHits = new Array(rbB.worldVertices.length).fill(null).map(_ => []);
      rbA.worldVertices.forEach((p1, i) => {
        const info = Utility.checkPointOverlap(p1, rbB);
        if (info.isOverlapping) edgeHits[info.edgeIndex].push({ a: rbA, b: rbB, pointIndex: i, edgeindex: info.edgeIndex, info });
      });

      // Process each collision, handling edges
      edgeHits.forEach((hits, i) => {
        if (hits.length == 0) return;
        if (hits.length == 1) { collisions.push(hits[0]); return; }

        // Average the collision points update
        for (let i = 1; i < hits.length; i++) hits[0].info.a.iAdd(hits[i].info.a);
        hits[0].info.a.iMult(1.0 / hits.length);
        hits[0].info.p = Utility.getClosestPointOnLine(hits[0].info.a, rbB.worldVertices[i], rbB.worldVertices[(i + 1) % rbB.worldVertices.length]);
        const dir =  hits[0].info.p.sub(hits[0].info.a);
        hits[0].info.n = dir.norm();
        hits[0].info.depth = dir.getLength();
        collisions.push(hits[0]);
      });
    };

    // Check each direction and return
    check(rb1, rb2);
    check(rb2, rb1);
    return collisions;
  }

  static checkPointOverlap(a, rb) {
    // Detect overlap through intersections
    const b = rb.worldAABB.b.copy().iAdd({ x: 1, y: 1 });
    const count = rb.worldVertices.filter((_, i) => Utility.checkLineOnLine(a, b, rb.worldVertices[i], rb.worldVertices[(i + 1) % rb.worldVertices.length])).length;
    if (count % 2 == 1) {

      // Return info for closest edge
      let closest = null;
      rb.worldVertices.forEach((_, i) => {
        const ea = rb.worldVertices[i];
        const eb = rb.worldVertices[(i + 1) % rb.worldVertices.length];
        if (eb.sub(ea).perp().dot(a.sub(ea)) <= 0) return;

        // Calculate point and then check whether shorter
        const p = Utility.getClosestPointOnLine(a, ea, eb);
        const dir = p.sub(a);
        const depth = dir.getLength();
        if (!closest || depth < closest.depth) closest = { isOverlapping: true, a: a.copy(), p, n: dir.norm(), depth, edgeIndex: i };
      });
      
      // Return best overlap
      return closest;
    }
    
    // Return empty info
    else return { isOverlapping: false, p: null, n: null, depth: 0, edgeIndex: -1 };
  }
}

class RigidbodySim {

  static GRAVITY = new Vector(0.0, 800);
  static SUB_FRAMES = 5.0;
  static POS_PCT = 0.95;
  static POS_SLOP = 0.01;
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
      // Cancel out dynamics
      if (rb.isStatic) {
        rb.rotVel = 0;
        rb.posVel.iMult(0);
        return;
      }
      
      // Apply gravity force
      if (this.hasGravity) rb.posVel.iAdd(RigidbodySim.GRAVITY.mult(dt));

      // Update pos / rot
      rb.pos.iAdd(rb.posVel.mult(dt));
      rb.rot += rb.rotVel * dt;
      rb.rot = (rb.rot + TWO_PI) % TWO_PI;

      // Update vertices
      rb.updateWorldShape();
    });
  }

  detectCollisions() {
    // Loop over and find all valid pairs
    this.collisions = [];
    for (let i = 0; i < this.rigidbodys.length - 1; i++) {
      for (let j = i + 1; j < this.rigidbodys.length; j++) {
        const rb1 = this.rigidbodys[i];
        const rb2 = this.rigidbodys[j];
        if (rb1.isStatic && rb2.isStatic) continue;
        const rb12Collisions = Utility.checkCollision(rb1, rb2);
        rb12Collisions.forEach(c => this.collisions.push(c));
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
      c.a.deltaUpdate = !c.a.isStatic;
      c.b.deltaUpdate = !c.b.isStatic;
    });
    
    // Apply and empty deltas
    this.rigidbodys.forEach(cl => {
      if (!cl.deltaUpdate) return;

      // Add deltas
      if (!cl.isStatic) {
        cl.pos.iAdd(cl.deltaPos);
        cl.rot += cl.deltaRot;
        cl.posVel.iAdd(cl.deltaPosVel);
        cl.rotVel += cl.deltaRotVel;
        cl.updateWorldShape();
      }
  
      // Empty deltas
      cl.deltaPos.iMult(0);
      cl.deltaPosVel.iMult(0);
      cl.deltaRot *= 0;
      cl.deltaRotVel *= 0;
      cl.deltaUpdate = false;
    });
  }
}

class Rigidbody {

  constructor(world_, isStatic_, density_) {
    // Add to world
    this.world = world_;
    this.world.rigidbodys.push(this);

    // Dynamics variables
    this.pos = new Vector(0, 0);
    this.posVel = new Vector(0, 0);
    this.rot = 0;
    this.rotVel = 0;

    // Physical attributes
    this.isStatic = isStatic_;
    this.density = density_;
    this.mass = 0;
    this.inertia = 0;

    // Shape data
    this.localVertices = [];
    this.localAABB = null;
    this.worldVertices = [];
    this.worldAABB = null;
    this.triangles = [];

    // Collision deltas
    this.updateDelta = false;
    this.deltaPos = new Vector(0, 0);
    this.deltaPosVel = new Vector(0, 0);
    this.deltaRot = 0;
    this.deltaRotVel = 0;
  }

  static createSquare(world_, isStatic_, density_, pos_, size) {
    // Setup points
    const WOBBLINESS = 0.15;
    const vertices = [];
    vertices.push(new Vector(-size.x * 0.5, -size.y * 0.5));
    vertices.push(new Vector(size.x * 0.5, -size.y * 0.5));
    vertices.push(new Vector(size.x * 0.5, size.y * 0.5));
    vertices.push(new Vector(-size.x * 0.5, size.y * 0.5));

    // Creatae and return rigidbody
    const newRigidbody = new Rigidbody(world_, isStatic_, density_);
    newRigidbody.pos = pos_;
    newRigidbody.setShape(vertices);
    return newRigidbody;
  }

  static createFunky(world_, isStatic_, density_, pos_, size) {
      // Setup points
      const WOBBLINESS = 0.15;
      const vertices = [];
      vertices.push(new Vector(0, -size.y * 0.5));
      vertices.push(new Vector(size.x * 0.5, -size.y * 0.5));
      vertices.push(new Vector(size.x * 0.3, 0));
      vertices.push(new Vector(size.x * 0.5, size.y * 0.2));
      vertices.push(new Vector(-size.x * 0.2, size.y * 0.35));
      vertices.push(new Vector(-size.x * 0.3, 0));
  
      // Creatae and return rigidbody
      const newRigidbody = new Rigidbody(world_, isStatic_, density_);
      newRigidbody.pos = pos_;
      newRigidbody.setShape(vertices);
      return newRigidbody;
  }
  

  show() {
    noFill();

    // Draw triangles
    stroke(120);
    this.triangles.forEach(t => triangle(
      this.worldVertices[t[0]].x, this.worldVertices[t[0]].y,
      this.worldVertices[t[1]].x, this.worldVertices[t[1]].y,
      this.worldVertices[t[2]].x, this.worldVertices[t[2]].y
    ));

    // Draw bounds
    stroke(150, 150, 220);
    rect(
      this.worldAABB.a.x, this.worldAABB.a.y,
      this.worldAABB.b.x - this.worldAABB.a.x,
      this.worldAABB.b.y - this.worldAABB.a.y
    );

    // Draw edge
    stroke(255);
    beginShape();
    this.worldVertices.forEach(v => vertex(v.x, v.y));
    endShape(CLOSE);

    // Draw centre
    ellipse(this.pos.x, this.pos.y, 5, 5);
  }


  setShape(newVertices) {
    // Set points and update
    this.localVertices = newVertices;
    this.updateLocalShape();
  }

  updateWorldShape() {
    // Setup rotation matrix
    const rotMat = [
      [cos(this.rot), -sin(this.rot)],
      [sin(this.rot),  cos(this.rot)] ];

    // Update world vertices and aABB
    this.worldVertices = this.localVertices.map(v => Utility.translatePoint(v, this.pos, rotMat));
    this.worldAABB = Utility.calculateAABB(this.worldVertices);
  }

  updateLocalShape() {
    // Recalculate physical attributes
    this.localAABB = Utility.calculateAABB(this.localVertices);
    this.triangles = Utility.triangulate(this.localVertices); 
    this.mass = Utility.calculateMass(this);
    this.inertia = Utility.calculateInertia(this);

    // Reculate world shape
    this.updateWorldShape();
  }
}
