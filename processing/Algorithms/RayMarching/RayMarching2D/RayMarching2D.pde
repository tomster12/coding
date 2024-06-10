
// #region - Setup

// Declare variables
PVector playerPos;
boolean[] inputs;
float[][] squares;
float[][] circles;


void setup() {
  // Main setup
  size(800, 800);
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  playerPos = new PVector(width * 0.5, height * 0.5);
  inputs = new boolean[600];

  // Setup squares
  squares = new float[][] {
    new float[] {150, 200, 200},
    new float[] {600, 420, 150}
  };

  // Setup circles
  circles = new float[][] {
    new float[] {400, 650, 120},
    new float[] {650, 220, 80}
  };
}

// #endregion


// #region - Main

void draw() {
  // Main draw
  background(#131316);

  // Update playerPos
  playerPos.add(new PVector(
    (inputs[37] ? -1 : 0) + (inputs[39] ? 1 : 0),
    (inputs[38] ? -1 : 0) + (inputs[40] ? 1 : 0)
  ));

  // Draw squares
  strokeWeight(3);
  stroke(#303030);
  fill(#e9eef2);
  for (float[] square : squares) {
    float cx = square[0];
    float cy = square[1];
    float size = square[2];
    rect(cx - size / 2, cy - size / 2, size, size);
  }

  // Draw circles
  for (float[] circle : circles) {
    float cx = circle[0];
    float cy = circle[1];
    float radius = circle[2];
    ellipse(cx, cy, radius * 2, radius * 2);
  }

  // Draw player
  ellipse(playerPos.x, playerPos.y, 20, 20);

  // Draw ellipse if hit
  PVector dir = new PVector(mouseX, mouseY).sub(playerPos).normalize();
  PVector hitPoint = march(playerPos, dir, true);
  if (hitPoint != null) {
    strokeWeight(3);
    stroke(#303030);
    fill(#e9eef2);
    ellipse(hitPoint.x, hitPoint.y, 20, 20);
  }
}


PVector march(PVector pos, PVector dir, boolean toDraw) {
  // Setup ray marching variables
  if (toDraw) stroke(0);
  if (toDraw) noFill();
  int count = 0;
  boolean hit = false;
  PVector curPos = pos.copy();

  // March outwards until hit or max
  while (count < 20 && !hit) {
    float dst = distToScene(curPos);
    if (toDraw) ellipse(curPos.x, curPos.y, dst * 2, dst * 2);
    curPos = curPos.add(dir.copy().mult(dst));
    if (dst < 1)
      hit = true;
    count++;
  }

  // Return whether hit or not
  if (hit) return curPos;
  else return null;
}


float distToScene(PVector pos) {
  // Calculate the distance to the scene
  float dst = 100000;

  // Squares
  for (float[] square : squares) {
    float cx = square[0];
    float cy = square[1];
    float size = square[2];
    float dx = abs(pos.x - cx) - size / 2;
    float dy = abs(pos.y - cy) - size / 2;
    float outdx = max(dx, 0);
    float outdy = max(dy, 0);
    float outDst = sqrt(outdx * outdx + outdy * outdy);
    float inDst = min(0, max(dx, dy));
    float squareDst = inDst + outDst;
    dst = min(dst, squareDst);
  }

  // Circles
  for (float[] circle : circles) {
    float cx = circle[0];
    float cy = circle[1];
    float radius = circle[2];
    float dx = pos.x - cx;
    float dy = pos.y - cy;
    float circleDst = sqrt(dx * dx + dy * dy) - radius;
    dst = min(dst, circleDst);
  }

  // Edges
  float leftEdgeDist = max(0, pos.x);
  float rightEdgeDist = max(0, width - pos.x);
  float topEdgeDist = max(0, pos.y);
  float bottomEdgeDist = max(0, height - pos.y);
  float edgeDist = min(leftEdgeDist, min(rightEdgeDist, min(topEdgeDist, bottomEdgeDist)));
  dst = min(dst, edgeDist);

  // Return distance
  return dst;
}

// #endregion


// #region - Inputs

void keyPressed() {
  // Update inputs
  inputs[keyCode] = true;
}


void keyReleased() {
  // Update inputs
  inputs[keyCode] = false;
}

// #endregion
