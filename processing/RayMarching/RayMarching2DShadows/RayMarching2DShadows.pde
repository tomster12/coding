
// #region - Setup

// Declare variables
float[][] squares;
float[][] circles;


void setup() {
  // Main setup
  size(800, 800);
  setupVariables();
}


void setupVariables() {
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
  background(0);

  // Draw shadows
  loadPixels();
  int quality = 4;
  for (int x = 0; x < width; x += quality) {
    for (int y = 0; y < height; y += quality) {
      int index = y * width + x;
      boolean reached = marchtoPosition(new PVector(x, y), new PVector(mouseX, mouseY));
      if (reached) {
        for (int qx = 0; qx < quality; qx++) {
          for (int qy = 0; qy < quality; qy++) {
            pixels[index + qx + qy * width] = color(255);
          }
        }
      }
    }
  }
  updatePixels();

  // Draw squares
  strokeWeight(3);
  stroke(#f1f1f1);
  fill(0);
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
}


boolean marchtoPosition(PVector pos, PVector target) {
  // Setup ray marching variables
  PVector dir = target.copy().sub(pos).normalize();
  PVector curPos = pos.copy();

  // March outwards until hit or max
  while (true) {
    float dstToScene = distToScene(curPos);
    float dstToTarget = target.copy().sub(curPos).mag();
    curPos = curPos.add(dir.copy().mult(min(dstToScene, dstToTarget)));
    if (dstToScene < 1)
      return false;
    if (dstToTarget < 1)
      return true;
  }
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

  // Return distance
  return dst;
}

// #endregion
