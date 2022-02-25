
class Shape {

  // #region - Setup

  constructor(pos_, vertexOffsets_, vertexTriangles_) {


    // Declare and initialize other variables
    this.vtxInfo = {
      offsets: vertexOffsets_,
      points: [],
      outer: [],
      triangles: vertexTriangles_
    }

    // Main setup
    this.updateVertexPoints();
    this.updateVertexOuterIndices();
    this.mass = this.calculateMass();
    this.momInertPos = this.calculateMomInertPos();
  }


  static newSquare(pos = new Float2(0, 0), size = new Float2(100, 100), quality = 1, wobbly = false, wobbliness = 0.3) {
    // Default square variables
    let dx = size.x / quality;
    let dy = size.y / quality;
    let offsets = [];
    let triangles = [];
    for (let y = 0; y <= quality; y++) {
      for (let x = 0; x <= quality; x++) {

        // Add new vertex
        let newVertexOffset = new Float2(
          -size.x * 0.5 + dx * x,
          -size.y * 0.5 + dy * y);

        // Offset if specified
        if (wobbly) {
          let wobblyFloat2 = new Float2(
            random(dx * wobbliness * 2) - dx * wobbliness,
            random(dy * wobbliness * 2) - dy * wobbliness);
          newVertexOffset = newVertexOffset.add(wobblyFloat2);
        } offsets.push(newVertexOffset);

        // Add vtxInfo.triangles if necessary
        if (x < quality && y < quality) {
          triangles.push([
            (y)     * (quality + 1) + (x),
            (y)     * (quality + 1) + (x + 1),
            (y + 1) * (quality + 1) + (x + 1)
          ]);
          triangles.push([
            (y)     * (quality + 1) + (x),
            (y + 1) * (quality + 1) + (x + 1),
            (y + 1) * (quality + 1) + (x)
          ]);
        }
      }
    }

    // Return completed shape
    let newShape = new Shape(pos, offsets, triangles);
    return newShape;
  }

  // #endregion


  // #region - Main

  earlyUpdate() {
    // Early updates
    this.detectCollisions();
  }


  update() {
    // General updates
    this.updateKinematics();
    this.updateVertexPoints();
  }


  show() {
    // Show each point
    noStroke();
    fill(255);
    for (let point of this.vtxInfo.points)
      ellipse(point.x, point.y, 2, 2);

    // show each triangle edge
    stroke(255);
    noFill();
    for (let i = 0; i < this.vtxInfo.triangles.length; i++) {
      beginShape();
      for (let index of this.vtxInfo.triangles[i])
        vertex(this.vtxInfo.points[index].x, this.vtxInfo.points[index].y);
      endShape(CLOSE);
    }

    // show vtxInfo.outer edge
    stroke("#db3caa");
    fill("#db3caa");
    beginShape();
    for (let outerIndices of this.vtxInfo.outer) {
      ellipse(this.vtxInfo.points[outerIndices[0]].x, this.vtxInfo.points[outerIndices[0]].y, 6, 6);
      line(this.vtxInfo.points[outerIndices[0]].x, this.vtxInfo.points[outerIndices[0]].y,
        this.vtxInfo.points[outerIndices[1]].x, this.vtxInfo.points[outerIndices[1]].y);
    }
  }

  // #endregion


  // #region - Kinematics

  // http://chrishecker.com/Rigid_body_dynamics


  updateKinematics() {
    this.updateCollision();

    // Update position
    this.posVel.ipAdd(this.posAcc);
    this.pos.ipAdd(this.posVel);
    this.posAcc.ipMult(0);

    // Update rotation
    this.rotVel += this.rotAcc;
    this.rot += this.rotVel;
    this.rotAcc *= 0;
    this.rot = (this.rot + TWO_PI) % TWO_PI;
  }


  updateCollision() {
    // Update each collision
    for (let collision of this.collisions) {
      this.pos.ipAdd(collision.diff);
      this.applyImpulseToPoint(collision.point, collision.jn);
    } this.collisions = [];
  }


  detectCollisions() {
    // For each other shape
    for (let oShp of shapes) {
      if (oShp != this) {

        // Calculate whether there is overlap
        let overlap = false;
        let p = null;
        let n = null;
        let diff = null;

        // Check this point over other shape

        // Calculate collision impulse
        if (overlap) {
          let cor = 0.88;
          let vecAPT = p.sub(this.pos).perp();
          let vecBPT = p.sub(oShp.pos).perp();
          let velAtPointAP = this.posVel.add(vecAPT.mult(this.rotVel));
          let velAtPointBP = oShp.posVel.add(vecAPT.mult(oShp.rotVel));
          let velAB = velAtPointBP.sub(velAtPointAP);
          let massA = this.mass;
          let massB = oShp.mass;
          let inertA = this.momInertPos;
          let inertB = oShp.momInertPos;
          let j = (-(1 + cor) * velAB.dot(n))
          / (n.dot(n.mult(1.0 / massA + 1.0 / massB))
          + (vecAPT.dot(n) * vecAPT.dot(n)) / inertA
          + (vecBPT.dot(n) * vecBPT.dot(n)) / inertB);

          // Add impulse
          if (diff.getLength() > 2) noLoop();
          this.collisions.push({point: p, jn: n.mult(-j), diff: diff.mult(-0.5)});
          oShp.collisions.push({point: p, jn: n.mult(j), diff: diff.mult(0.5)});
        }
      }
    }
  }


  applyImpulseToPoint(point, jn) {
    // jn = mv - mu
    // posVel += (jn) / mass;
    // rotAcc += (jn • rAP^T) / momInert;
    this.posVel.ipAdd(jn.mult(1.0 / this.mass));
    this.rotVel += point.sub(this.pos).perp().dot(jn) / this.momInertPos;
  }


  calculateMass() {
    // Use density and area of triangles
    // dens * vol = mass
    // s = 1/2 ( a + b + c )
    // Area = sqrt ( s ( s-a) ( s-b) ( s-c) )
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

  // #endregions


  // #region - Vertices

  updateVertexPoints() {
    // Update vtxInfo.points using vtxInfo.offsets
    let rotMat = [
      [cos(this.rot), -sin(this.rot)],
      [sin(this.rot),  cos(this.rot)]];
    for (let i = 0; i < this.vtxInfo.offsets.length; i++)
      this.vtxInfo.points[i] = this.pos.add(this.vtxInfo.offsets[i].matMult(rotMat));
  }


  updateVertexOuterIndices() {
    // Find all edges which are unique
    this.vtxInfo.outer = [];
    let allEdges = [];

    // Create a list of all edges
    for (let t = 0; t < this.vtxInfo.triangles.length; t++) {
      allEdges.push([this.vtxInfo.triangles[t][0], this.vtxInfo.triangles[t][1], this.vtxInfo.triangles[t][2]]);
      allEdges.push([this.vtxInfo.triangles[t][1], this.vtxInfo.triangles[t][2], this.vtxInfo.triangles[t][0]]);
      allEdges.push([this.vtxInfo.triangles[t][2], this.vtxInfo.triangles[t][0], this.vtxInfo.triangles[t][1]]);
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
        this.vtxInfo.outer.push(current);
        for (let edge of allEdges) {
          if (edge[0] == current[1]) {
            current = edge;
            break;
          }
        }
      }
    }
  }


  removeIndex(index) {
    // Ensure index is in range
    if (index < 0 || index >= this.vtxInfo.offsets.length)
      return;

    // Remove corresponding vertexOffset
    this.vtxInfo.offsets.splice(index, 1);

    // Loop over all vtxInfo.triangles
    for (let i = 0; i < this.vtxInfo.triangles.length; i++) {

      // Remove it if it overlaps index
      if (this.vtxInfo.triangles[i].indexOf(index) != -1) {
        this.vtxInfo.triangles.splice(i, 1);
        i--;

      // Lower other indices above index
      } else {
        for (let o = 0; o < this.vtxInfo.triangles[i].length; o++) {
          if (this.vtxInfo.triangles[i][o] > index) {
            this.vtxInfo.triangles[i][o]--;
          }
        }
      }
    }

    // Update vtxInfo.outer
    this.updateVertexPoints();
    this.updateVertexOuterIndices();
  }

  // #endregion
}
