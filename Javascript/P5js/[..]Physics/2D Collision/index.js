
// #region - Driver

let SIM;


function setup() {
  createCanvas(600, 600);
  setupVariables();
}

function setupVariables() {
  SIM = new PhysicsWorld(true);

  // World 1
  const s1 = Collider.newFunky(SIM, false, 0.3, new Float2(250, 350), new Float2(100, 100));
  s1.posVel.iAdd({ x: 50, y: 0 });
  s1.rotVel += 1.2;
  const s2 = Collider.newSquare(SIM, false, 0.3, new Float2(320, 250), new Float2(230, 45));
  s2.rotVel += 0.2;
  Collider.newFunky(SIM, false, 0.3, new Float2(400, 350), new Float2(80, 80));
  Collider.newSquare(SIM, false, 0.3, new Float2(300, 0), new Float2(20, 20));
  Collider.newFunky(SIM, false, 0.3, new Float2(280, -30), new Float2(20, 20));
  Collider.newSquare(SIM, true, 0.3, new Float2(300, 500), new Float2(500, 25));
  Collider.newSquare(SIM, true, 0.3, new Float2(100, 300), new Float2(25, 500));
  Collider.newSquare(SIM, true, 0.3, new Float2(500, 300), new Float2(25, 500));

  // World 2
  // const s1 = Collider.newSquare(SIM, false, 1, new Float2(250, 200), new Float2(100, 100));
  // Collider.newSquare(SIM, true, 0.3, new Float2(300, 500), new Float2(500, 25));
}


function draw() {
  background(0);
  SIM.draw();
}

// #endregion


class Float2 {

  constructor(x_, y_) {
    this.x = x_;
    this.y = y_;
  }


  add = (other) => new Float2(this.x + other.x, this.y + other.y);
  sub = (other) => new Float2(this.x - other.x, this.y - other.y);
  mult = (val) => new Float2(this.x * val, this.y * val);

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
  
  perp = () => new Float2(-this.y, this.x);
  dot = (other) => this.x * other.x + this.y * other.y;
  cross = (other) =>  this.x * other.y - this.y * other.x;
  norm = () => {
    const dst = this.getLength();
    return new Float2(this.x / dst, this.y / dst);
  };


  getLengthSq = () => this.x * this.x + this.y * this.y;
  getLength = () => sqrt(this.getLengthSq());
  toString = () => "(" + this.x + ", " + this.y + ")";
  copy = () => new Float2(this.x, this.y);
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
    const b = bounds.b.copy().iAdd({ x: 5, y: 1 });
    const count = edges.reduce((dVel, e) => this.checkLineOnLine(a, b, e.a, e.b) ? dVel + 1 : dVel, 0);
    if (count % 2 == 1) {

      // Return info for closest edge
      return edges.reduce((acc, e) => {
        const p = this.closestPointOnLine(a, e.a, e.b);
        const dir = p.sub(a);
        const depth = dir.getLength();
        if (!acc || depth < acc.depth) {
          return { isOverlapping: true, a, p, n: dir.norm(), depth };
        } else return acc;
      }, null);
    }
    
    // Return empty info
    else return { isOverlapping: false, p: null, n: null, depth: 0 };
  }

  static checkLineOnLine(a, b, c, d) {
    // Check line overlap (no colinearity checks)
    const ccw = (A,B,C) => (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);
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

class PhysicsWorld {

  static GRAVITY = new Float2(0.0, 800);
  static SUB_FRAMES = 4.0;
  static POS_PCT = 0.8;
  static POS_SLOP = 0.005;


  constructor(hasGravity_) {
    this.colliders = [];
    this.collisions = [];
    this.hasGravity = hasGravity_;
    this.dt = 0.0;
  }


  draw() {
    // Update physics and show
    this.dt = 1.0 / 60.0;
    this.stepPhysics(this.dt);
    for (let cl of this.colliders) cl.show();
  }

  stepPhysics(dt) {
    // Split DT up and step forward
    for (let _ = 0; _ < PhysicsWorld.SUB_FRAMES; _++) {
      this.stepDynamics(dt / PhysicsWorld.SUB_FRAMES);
      this.detectCollisions();
      this.resolveImpulse();
      this.resolvePositions();
      // if (this.collisions.length != 0) { noLoop(); break; }
    }
  }

  stepDynamics(dt) {
    this.colliders.forEach(cl => {
      // Do not move static
      if (cl.isStatic) {
        cl.posVel.iMult(0);
        cl.posVelD.iMult(0);
        cl.rotVel *= 0;
        cl.rotVelD *= 0;
        return;
      }

      // Apply gravity force
      if (this.hasGravity) cl.posVelD.iAdd(PhysicsWorld.GRAVITY.mult(dt));

      // Update position
      cl.posVel.iAdd(cl.posVelD);
      cl.pos.iAdd(cl.posVel.mult(dt));
      cl.posVelD.iMult(0);

      // Update rotation
      cl.rotVel += cl.rotVelD;
      cl.rot += cl.rotVel * dt;
      cl.rot = (cl.rot + TWO_PI) % TWO_PI;
      cl.rotVelD *= 0;

      // Update vertices
      cl.onPointsMoved();
    });
  }

  detectCollisions() {
    // Find all collisions
    this.collisions = [];
    for (let i = 0; i < this.colliders.length - 1; i++) {
      for (let j = i + 1; j < this.colliders.length; j++) {
        const cl1 = this.colliders[i];
        const cl2 = this.colliders[j];
        if (cl1.isStatic && cl2.isStatic) continue;

        // Check overlap of c1 points inside c2
        for (const p1 of cl1.worldEdgePoints) {
          const info = Utility.checkPointInPoints(p1, cl2.worldBounds, cl2.edges);
          if (info.isOverlapping) this.collisions.push({ a: cl1, b: cl2, info });
        }
        
        // Check overlap of c2 points inside c1
        for (const p2 of cl2.worldEdgePoints) {
          const info = Utility.checkPointInPoints(p2, cl1.worldBounds, cl1.edges);
          if (info.isOverlapping) this.collisions.push({ a: cl2, b: cl1, info });
        }
      }
    }
  }

  resolveImpulse() {
    this.collisions.forEach(c => {
      // Setup needed variables
      const e = 1;
      const p = c.info.a;
      const n = c.info.n;
      const m_a = c.a.mass;
      const m_b = c.b.mass;
      const I_a = c.a.inertia;
      const I_b = c.b.inertia;
      const rP_a = p.sub(c.a.pos);
      const rP_b = p.sub(c.b.pos);
      const rPT_a = rP_a.perp();
      const rPT_b = rP_b.perp();
      const vP_a = c.a.posVel.add(rPT_a.mult(c.a.rotVel));
      const vP_b = c.b.posVel.add(rPT_a.mult(c.b.rotVel));
      const vRP = vP_b.sub(vP_a);
      const vN = vRP.dot(n);

      // Calculate impulse including static
      const mI_a = c.a.isStatic ? 0.0 : 1.0 / m_a;
      const mI_b = c.b.isStatic ? 0.0 : 1.0 / m_b;
      const II_a = c.a.isStatic ? 0.0 : 1.0 / I_a;
      const II_b = c.b.isStatic ? 0.0 : 1.0 / I_b;
      const rI_a = pow(rPT_a.dot(n), 2) * II_a;
      const rI_b = pow(rPT_b.dot(n), 2) * II_b;
      // const j = -(1 + e) * vN / n.dot(n.mult(mI_a + mI_b));
      const j = -(1 + e) * vN / (n.dot(n.mult(mI_a + mI_b)) + rI_a + rI_b);
      // const j = -(1 + e) * vN / (mI_a + mI_b + (rI_a + rI_b).dot(n));

      // Apply impulse if not static to A
      if (!c.a.isStatic) {
        const jn_a = n.mult(-j);
        const dV_a = jn_a.mult(mI_a);
        const dRV_a = rPT_a.dot(jn_a) * II_a / TWO_PI;
        c.a.posVelD.iAdd(dV_a);
        c.a.rotVelD += dRV_a;
        // console.log("\n");
        // console.log("Values 1: " + vN, mI_a, mI_b, rI_a, rI_b);
        // console.log("Values 2: " + j, jn_a.toString());
        // console.log("Point Dir: " + rP_a);
        // console.log("Body Velocity: " + c.a.posVel);
        // console.log("Point Velocity: " + vP_a);
        // console.log("Delta Body Velocity: " + dV_a); 
        // console.log("Delta Body Rot Velocity: " + dRV_a);
      }
      
      // Apply impulse if not static to B
      if (!c.b.isStatic) {
        const jn_b = n.mult(j);
        const dV_b = jn_b.mult(mI_b);
        const dRV_b = rPT_b.dot(jn_b) * II_b / TWO_PI;
        c.b.posVelD.iAdd(dV_b);
        c.b.rotVelD += dRV_b;
      }
    });
  }

  resolvePositions() {
    this.collisions.forEach(c => {
      // Setup correction variables
      const mI_a = c.a.isStatic ? 0 : 1.0 / c.a.mass;
      const mI_b = c.b.isStatic ? 0 : 1.0 / c.b.mass;

      // Calculate correction
      const amount = PhysicsWorld.POS_PCT * max(c.info.depth - PhysicsWorld.POS_SLOP, 0.0) / (mI_a + mI_b);
      const correction = c.info.n.mult(amount);

      // Apply correction to A
      if (!c.a.isStatic) {
        const correction_a = correction.mult(mI_a);
        c.a.pos.iAdd(correction_a);
      }

      // Apply correction to B
      if (!c.b.isStatic) {
        const correction_b = correction.mult(mI_b);
        c.b.pos.iSub(correction_b);
      }
    });
  }


  addCollider = (cl) => this.colliders.push(cl);
}

class Collider {

  constructor(world_, isStatic_, density_) {
    // Add to world
    this.world = world_;
    this.world.addCollider(this);

    // Initialize physics
    this.isStatic = isStatic_;
    this.density = density_;
    this.pos = new Float2(0, 0);
    this.posVel = new Float2(0, 0);
    this.posVelD = new Float2(0, 0);
    this.rot = 0;
    this.rotVel = 0;
    this.rotVelD = 0;

    // Initialize mesh
    this.localEdgePoints = [];
    this.worldEdgePoints = [];
    this.localBounds = null;
    this.worldBounds = null;
  }

  static newSquare(world_, isStatic_, density_, pos_, size) {
    // Setup points
    const WOBBLINESS = 0.15;
    const localEdgePoints = [];
    localEdgePoints.push(new Float2(-size.x * 0.5, -size.y * 0.5));
    localEdgePoints.push(new Float2(size.x * 0.5, -size.y * 0.5));
    localEdgePoints.push(new Float2(size.x * 0.5, size.y * 0.5));
    localEdgePoints.push(new Float2(-size.x * 0.5, size.y * 0.5));

    // Creatae and return collider
    const newCollider = new Collider(world_, isStatic_, density_);
    newCollider.pos = pos_;
    newCollider.setPoints(localEdgePoints);
    return newCollider;
  }

  static newFunky(world_, isStatic_, density_, pos_, size) {
      // Setup points
      const WOBBLINESS = 0.15;
      const localEdgePoints = [];
      localEdgePoints.push(new Float2(0, -size.y * 0.5));
      localEdgePoints.push(new Float2(size.x * 0.5, -size.y * 0.5));
      localEdgePoints.push(new Float2(size.x * 0.3, 0));
      localEdgePoints.push(new Float2(size.x * 0.5, size.y * 0.2));
      localEdgePoints.push(new Float2(-size.x * 0.2, size.y * 0.35));
      localEdgePoints.push(new Float2(-size.x * 0.3, 0));
  
      // Creatae and return collider
      const newCollider = new Collider(world_, isStatic_, density_);
      newCollider.pos = pos_;
      newCollider.setPoints(localEdgePoints);
      return newCollider;
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
    this.onPointsChanged();
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

  onPointsChanged() {
    // Ensure world point array is good
    if (this.worldEdgePoints.length != this.localEdgePoints.length) {
      this.worldEdgePoints = [];
      for (let _ = 0; _ < this.localEdgePoints.length; _++) this.worldEdgePoints.push(new Float2(0, 0));
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
