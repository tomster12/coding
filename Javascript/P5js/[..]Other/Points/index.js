
// #region - Setup

// Declare variables
let shapes;


function setup() {
  // Main setup
  createCanvas(600, 600);
  setupVariables();
}


function setupVariables() {
  // Initialize variables
  shapes = [];
  shapes.push(Shape.newSquare(new Float2(150, 150), new Float2(200, 200), 8, true));
  shapes.push(Shape.newSquare(new Float2(450, 150), new Float2(200, 200), 8, true));
  shapes.push(Shape.newSquare(new Float2(150, 450), new Float2(200, 200), 8, true));
  shapes.push(Shape.newSquare(new Float2(450, 450), new Float2(200, 200), 8, true));
}

// #endregion


// #region - Main

function draw() {
  background(0);

  // Update all shapes
  for (let shape of shapes)
    shape.update();

  // Draw all shapes
  for (let shape of shapes)
    shape.show();
}

// #endregion


class Shape {

  // #region - Setup

  constructor(pos_, vertexOffsets_, vertexTriangles_) {
    // Declare and initialize variables
    this.pos = pos_;
    this.vtxInfo = {
      offsets: vertexOffsets_,
      points: [],
      outer: [],
      triangles: vertexTriangles_
    }

    // Main setup
    this.updateVertexOuterIndices();
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

  update() {
    // General updates
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
    stroke("#ff00ed");
    noFill();
    beginShape();
    for (let outerIndices of this.vtxInfo.outer)
      vertex(this.vtxInfo.points[outerIndices[0]].x, this.vtxInfo.points[outerIndices[0]].y);
    endShape(CLOSE);
  }


  updateVertexPoints() {
    // Update vtxInfo.points using vtxInfo.offsets
    for (let i = 0; i < this.vtxInfo.offsets.length; i++)
      this.vtxInfo.points[i] = this.pos.add(this.vtxInfo.offsets[i]);
  }


  updateVertexOuterIndices() {
    // Find all edges which are unique
    this.vtxInfo.outer = [];
    let allEdges = [];

    // Create a list of all edges
    for (let t = 0; t < this.vtxInfo.triangles.length; t++) {
      allEdges.push([this.vtxInfo.triangles[t][0], this.vtxInfo.triangles[t][1], t]);
      allEdges.push([this.vtxInfo.triangles[t][1], this.vtxInfo.triangles[t][2], t]);
      allEdges.push([this.vtxInfo.triangles[t][2], this.vtxInfo.triangles[t][0], t]);
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

      // Remove it if it contains index
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


class Float2 {

  // #region - main

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


  add(other) {
    // Returns a new vector which is sum of this and other
    return new Float2(this.x + other.x, this.y + other.y);
  }


  sub(other) {
    // Returns a new vector which is this subtract other
    return new Float2(this.x - other.x, this.y - other.y);
  }


  perp() {
    // Returns the perpendicular vector to this
    return new Float2(-this.y, this.x);
  }


  dot(other) {
    // Returns the dot product of this float with the other
    return this.x * other.x + this.y * other.y;
  }

  // #endregion
}
