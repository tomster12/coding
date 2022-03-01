
// #region - Setup

let rigidMeshSimulation;


function setup() {
  // Main setup
  createCanvas(600, 600);
  setupVariables();
}


function setupVariables() {
  rigidMeshSimulation = new RigidMeshSimulation();
  let s1 = RigidMesh.createSquare(
    rigidMeshSimulation,
    new Float2(150, 300),
    new Float2(100, 100),
    2
  );
  RigidMesh.createSquare(
    rigidMeshSimulation,
    new Float2(450, 300),
    new Float2(100, 100),
    2
  );
  s1.vel.x += 40;
  s1.rotVel += 0.3;
}

// #endregion


// #region - Main

function draw() {
  background(0);
  rigidMeshSimulation.update();
}

// #endregion


// Handle physics and visuals
class RigidMesh {

  // #region - Setup

  constructor(rigidMeshSimulation_) {

    // Setup and add to rigidMeshSimulation
    this.rigidMeshSimulation = rigidMeshSimulation_;
    this.rigidMeshSimulation.addRigidMesh(this);

    // Declare and initialize mesh variables
    this.vtxOffsets = [];
    this.vtxPoints = [];
    this.vtxOuter = [];
    this.triangles = [];

    // Declare and initialize physics variables
    this.pos = new Float2(0, 0);
    this.vel = new Float2(0, 0);
    this.acc = new Float2(0, 0);

    this.rot = 0;
    this.rotVel = 0;
    this.rotAcc = 0;

    this.collisions = [];
  }


  setMesh(
  vtxOffsets_ = this.vtxOffsets_,
  triangles_ = this.triangles_) {

    // Set each of the mesh variables
    this.vtxOffsets = vtxOffsets_;
    this.triangles = triangles_;

    // Setup points and outer
    this.updateVtxPoints();
    this.updateVtxOuterInfo();
  }


  setTransform(
  pos_ = this.pos,
  vel_ = this.vel,
  acc_ = this.acc,
  rot_ = this.rot,
  rotVel_ = this.rotVel,
  rotAcc_ = this.rotAcc) {

    // Set each of the transform variables
    this.pos = pos_;
    this.vel = vel_;
    this.acc = acc_;
    this.rot = rot_;
    this.rotVel = rotVel_;
    this.rotAcc = rotAcc_;
  }


  static createSquare(rigidMeshSimulation_, pos_, size, quality) {
    // Setup new rigidMesh and variables
    let newRigidMesh = new RigidMesh(rigidMeshSimulation_, pos_);
    let vtxOffsets = [];
    let triangles = [];

    // Setup vtxOffsets and triangles for square
    let dx = size.x / quality;
    let dy = size.y / quality;
    for (let y = 0; y <= quality; y++) {
      for (let x = 0; x <= quality; x++) {

        // Setup vertex
        let newVtxOffset = new Float2(
          -size.x * 0.5 + dx * x,
          -size.y * 0.5 + dy * y);

        // Wobbly offset
        if (true) {
          let wobbliness = 0.3;
          let wobblyFloat2 = new Float2(
            random(dx * wobbliness * 2) - dx * wobbliness,
            random(dy * wobbliness * 2) - dy * wobbliness);
          newVtxOffset = newVtxOffset.add(wobblyFloat2);
        } vtxOffsets.push(newVtxOffset);

        // Setup triangles
        if (x < quality && y < quality) {
          triangles.push([
            (y)     * (quality + 1) + (x),
            (y)     * (quality + 1) + (x + 1),
            (y + 1) * (quality + 1) + (x + 1) ]);
          triangles.push([
            (y)     * (quality + 1) + (x),
            (y + 1) * (quality + 1) + (x + 1),
            (y + 1) * (quality + 1) + (x) ]);
        }
      }
    }

    // Update and return new rigidMesh
    newRigidMesh.setTransform(pos_);
    newRigidMesh.setMesh(vtxOffsets, triangles);
    return newRigidMesh;
  }

  // #endregion


  // #region - Vertex

  updateVtxPoints() {
    // Update vtxPoints using vtxOffsets and pos / rot
    let rotMat = [
      [cos(this.rot), -sin(this.rot)],
      [sin(this.rot),  cos(this.rot)]];
    for (let i = 0; i < this.vtxOffsets.length; i++)
      this.vtxPoints[i] = this.pos.add(this.vtxOffsets[i].matMult(rotMat));
  }


  updateVtxOuterInfo() {
    // Find all edges which are unique
    this.vtxOuter = [];
    let allEdges = [];

    // Create a list of all edges
    for (let t = 0; t < this.triangles.length; t++) {
      allEdges.push([this.triangles[t][0], this.triangles[t][1], this.triangles[t][2]]);
      allEdges.push([this.triangles[t][1], this.triangles[t][2], this.triangles[t][0]]);
      allEdges.push([this.triangles[t][2], this.triangles[t][0], this.triangles[t][1]]);
    }

    // Compare each edge against each other
    for (let e0 = 0; e0 < allEdges.length; e0++) {
      for (let e1 = e0 + 1; e1 < allEdges.length; e1++) {
        if ((allEdges[e0][0] == allEdges[e1][0]
        && allEdges[e0][1] == allEdges[e1][1])
        || (allEdges[e0][0] == allEdges[e1][1]
        && allEdges[e0][1] == allEdges[e1][0])) {
          allEdges.splice(e1, 1); e1--;
          allEdges.splice(e0, 1); e0--;
        }
      }
    }

    // Path around unique allEdges
    if (allEdges.length > 2) {
      let current = null;
      while (current != allEdges[0]) {
        if (current == null) current = allEdges[0];
        this.vtxOuter.push(current);
        for (let edge of allEdges) {
          if (edge[0] == current[1]) {
            current = edge;
            break;
          }
        }
      }
    }
  }


  containsPoint(point) {
    // Have list of points
    // Have list of triangles
    // Have list of outer points
    // Given a point

    // Find if any outer triangle contains point
    // If so find line normal and vector from line to points

    // For each outer triangle
    for (let outerEdge of this.vtxOuter) {

      // Check whether contains point
      let contains = false;
      let a = this.vtxPoints[outerEdge[0]];
      let b = this.vtxPoints[outerEdge[1]];
      let c = this.vtxPoints[outerEdge[2]];
      // console.log("Checking " + point + " is within: ");
      // console.log(a, b, c);
      let abDotas = ((b.x - a.x) * (point.x - a.x) + (b.y - a.y) * (point.y - a.y)) > 0;
      let bcDotbs = ((c.x - b.x) * (point.x - b.x) + (c.y - b.y) * (point.y - b.y)) > 0;
      let caDotcs = ((a.x - c.x) * (point.x - c.x) + (a.y - c.y) * (point.y - c.y)) > 0;
      if (abDotas == bcDotbs && abDotas == caDotcs) contains = true;

      // If contains point find variables
      if (contains) {
        let n = b.sub(a).perp();
        let p = point;

        // Calculate difference
        let d = b.sub(a);
        let x = a.add(d.mult(p.sub(a).dot(d)));
        let diff = p.sub(x);

        // Return values
        console.log(a, b, c);
        console.log(p, n, diff);
        return { contains: true, p: p, n: n, diff: diff }
      }
    }

    // No edges contain
    return { contains: false, p: null, n: null, diff: null }
  }


  removeIndex(index) {
    // Ensure index is in range then splice
    if (index < 0 || index >= this.vtxOffsets.length)
      return;
    this.vtxOffsets.splice(index, 1);

    // Remove all triangles containing index
    for (let i = 0; i < this.triangles.length; i++) {
      if (this.triangles[i].indexOf(index) != -1) {
        this.triangles.splice(i, 1);
        i--;

      // Lower other indices above index
      } else {
        for (let o = 0; o < this.triangles[i].length; o++) {
          if (this.triangles[i][o] > index) this.triangles[i][o]--;
        }
      }
    }

    // Update vtxInfo.outer
    this.updateVertexPoints();
    this.updateVertexOuterIndices();
  }

  // #endregion


  // #region - Main

  show() {
    // Show each point
    noStroke();
    fill(255);
    for (let point of this.vtxPoints)
      ellipse(point.x, point.y, 2, 2);

    // show each triangle edge
    stroke(255);
    noFill();
    for (let i = 0; i < this.triangles.length; i++) {
      beginShape();
      for (let index of this.triangles[i])
        vertex(this.vtxPoints[index].x, this.vtxPoints[index].y);
      endShape(CLOSE);
    }

    // show vtxInfo.outer edge
    stroke("#db3caa");
    fill("#db3caa");
    beginShape();
    for (let outerIndices of this.vtxOuter) {
      ellipse(this.vtxPoints[outerIndices[0]].x, this.vtxPoints[outerIndices[0]].y, 6, 6);
      line(this.vtxPoints[outerIndices[0]].x, this.vtxPoints[outerIndices[0]].y,
        this.vtxPoints[outerIndices[1]].x, this.vtxPoints[outerIndices[1]].y);
    }
  }

  // #endregion


  // #region - Kinematic

  timeStep(dt) {
    // Update position
    this.vel.ipAdd(this.acc.mult(dt));
    this.pos.ipAdd(this.vel.mult(dt));
    this.acc.ipMult(0);

    // Update rotation
    this.rotVel += this.rotAcc * dt;
    this.rot += this.rotVel * dt;
    this.rotAcc *= 0;
    this.rot = (this.rot + TWO_PI) % TWO_PI;

    // Update vertices
    this.updateVtxPoints();
  }


  detectCollisions() {
    // For each other shape
    for (let oRigidMesh of this.rigidMeshSimulation.rigidMeshes) {
      if (oRigidMesh != this) {

        // Calculate whether there is overlap
        let overlap = false;
        let p = null;
        let n = null;
        let diff = null;

        // Check this point over other shape
        for (let outerEdge of this.vtxOuter) {
          let point = this.vtxPoints[outerEdge[0]];
          let containInfo = oRigidMesh.containsPoint(point);
          if (containInfo.contains) {
            overlap = true;
            p = containInfo.p;
            n = containInfo.n;
            diff = containInfo.diff;
          }
        }

        // Calculate collision impulse
        if (overlap) {
          console.log("Collision");
          noLoop();
          let cor = 0.88;
          let vecAPT = p.sub(this.pos).perp();
          let vecBPT = p.sub(oRigidMesh.pos).perp();
          let velAtPointAP = this.vel.add(vecAPT.mult(this.rotVel));
          let velAtPointBP = oRigidMesh.vel.add(vecAPT.mult(oRigidMesh.rotVel));
          let velAB = velAtPointBP.sub(velAtPointAP);
          let massA = this.mass;
          let massB = oRigidMesh.mass;
          let inertA = this.momInertPos;
          let inertB = oRigidMesh.momInertPos;
          let j = (-(1 + cor) * velAB.dot(n))
          / (n.dot(n.mult(1.0 / massA + 1.0 / massB))
          + (vecAPT.dot(n) * vecAPT.dot(n)) / inertA
          + (vecBPT.dot(n) * vecBPT.dot(n)) / inertB);

          // Add impulse
          this.collisions.push({point: p, jn: n.mult(-j), diff: diff.mult(-0.5)});
          oRigidMesh.collisions.push({point: p, jn: n.mult(j), diff: diff.mult(0.5)});
        }
      }
    }
  }


  updateCollisions() {
    // Update each collision
    for (let collision of this.collisions) {
      this.pos.ipAdd(collision.diff);
      this.applyImpulseToPoint(collision.point, collision.jn);
    } this.collisions = [];
  }


  applyImpulseToPoint(point, jn) {
    // jn = mv - mu
    // vel += (jn) / mass;
    // rotAcc += (jn • rAP^T) / momInert;
    this.vel.ipAdd(jn.mult(1.0 / this.mass));
    this.rotVel += point.sub(this.pos).perp().dot(jn) / this.momInertPos;
  }


  calculateMass() {
    // Use density and area of triangles
    // dens * vol = mass
    // s = 1/2 ( a + b + c )
    // Area = sqrt ( s (s-a) (s-b) (s-c) )
    let totalMass = 0;
    for (let triangle of this.vtxInfo.triangles) {
      let a = this.vtxInfo.points[triangle[1]].sub(this.vtxInfo.points[triangle[0]]).getLength();
      let b = this.vtxInfo.points[triangle[2]].sub(this.vtxInfo.points[triangle[1]]).getLength();
      let c = this.vtxInfo.points[triangle[0]].sub(this.vtxInfo.points[triangle[2]]).getLength();
      let s = 0.5 * (a + b + c);
      let area = sqrt(s * (s - a) * (s - b) * (s - c));
      totalMass += area * this.density;
    } return totalMass;
  }


  calculateMomInertPos() {
    // Sum of (mass * perpRad^2) for each point
    // Use equation online for each triangle
    let totalMomInertPos = 0;
    totalMomInertPos = 500000000000;
    return totalMomInertPos;
  }

  // #endregion
}


class RigidMeshSimulation {

  // #region - Setup

  constructor() {
    // Initialize and declare variables
    this.rigidMeshes = [];
  }

  // #endregion


  // #region - Main

  update() {
    // Update and show all rigid meshes
    this.timeStep((frameRate() > 0)
    ? (1 / frameRate()) : (1 / 60));
    for (let rm of this.rigidMeshes)
      rm.show();
  }


  timeStep(dt) {
    // Move time forward by dt
    for (let rm of this.rigidMeshes)
      rm.timeStep(dt);

    // Check collisions on each rm
    for (let rm of this.rigidMeshes)
      rm.detectCollisions();

    // Update collisions on each rm
    for (let rm of this.rigidMeshes)
      rm.updateCollisions();
  }


  addRigidMesh(newRM) {
    // Add a rigidbody to the simulation
    this.rigidMeshes.push(newRM);
  }

  // #endregion
}


class Float2 {

  // #region - Setup

  constructor(x_, y_) {
    // Initialize and declare variables
    this.x = x_;
    this.y = y_;
  }


  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }

  // #endregion


  // #region - Main

  getLengthSq() {
    // Returns the length of this vector squared
    return this.x * this.x + this.y * this.y;
  }

  getLength() {
    // Returns the length of this vector
    return sqrt(this.getLengthSq());
  }


  add(other) {
    // Returns a new vector which is sum of this and other
    return new Float2(this.x + other.x, this.y + other.y);
  }

  sub(other) {
    // Returns a new vector which is this subtract other
    return new Float2(this.x - other.x, this.y - other.y);
  }

  mult(val) {
    // Returns a new vector which is this multiplied by val
    return new Float2(this.x * val, this.y * val);
  }

  matMult(mat) {
    // Returns a new vector which is this matrix multiplied by mat
    let nx = mat[0][0] * this.x + mat[0][1] * this.y;
    let ny = mat[1][0] * this.x + mat[1][1] * this.y;
    return new Float2(nx, ny);
  }


  ipAdd(other) {
    // sets this vector to the sum of this and other
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  ipSub(other) {
    // sets this vector to subtract other
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  ipMult(val) {
    // sets this vector to this multiplied by val
    this.x *= val;
    this.y *= val;
    return this;
  }

  ipMatMult(mat) {
    // Sets this vector to this matrix multiplied by mat
    let nx = mat[0][0] * this.x + mat[0][1] * this.y;
    let ny = mat[1][0] * this.x + mat[1][1] * this.y;
    this.x = nx;
    this.y = ny;
    return this;
  }


  perp() {
    // Returns the perpendicular vector to this
    return new Float2(-this.y, this.x);
  }

  dot(other) {
    // Returns the dot product of this float with the other
    return this.x * other.x + this.y * other.y;
  }

  cross(other) {
    // Returns the 2d cross produt of this with the other
    return this.x * other.y - this.y * other.x;
  }

  // #endregion
}
