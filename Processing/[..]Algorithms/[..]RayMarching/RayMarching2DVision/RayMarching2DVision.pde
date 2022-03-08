
// #region - Setup

// Declare variables
float[][] rects;
float[][] circles;


void setup() {
  // Main setup
  size(800, 800);
  setupVariables();
}


void setupVariables() {
  // Setup rects
  rects = new float[][] {
    new float[] {100, 0, 700, 100},

    new float[] {200, 200, 15, 15},
    new float[] {240, 200, 15, 15},
    new float[] {280, 200, 15, 15},
    new float[] {200, 240, 15, 15},
    new float[] {240, 240, 15, 15},
    new float[] {280, 240, 15, 15},
    new float[] {200, 280, 15, 15},
    new float[] {240, 280, 15, 15},
    new float[] {280, 280, 15, 15},

    new float[] {200, 450, 700, 20},
    new float[] {200, 500, 700, 20},
    new float[] {200, 550, 700, 20},

    new float[] {0, 0, 100, 800}
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
      if (reached) pixels[index] = color(255);
    }
  }
  updatePixels();

  // Draw rects
  strokeWeight(3);
  stroke(#f1f1f1);
  fill(0);
  for (float[] rect : rects) {
    float px = rect[0];
    float py = rect[1];
    float sizeX = rect[2];
    float sizeY = rect[3];
    rect(px, py, sizeX, sizeY);
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

  // Rects
  for (float[] rect : rects) {
    float sizeX = rect[2];
    float sizeY = rect[3];
    float cx = rect[0] + sizeX / 2;
    float cy = rect[1] + sizeY / 2;
    float dx = abs(pos.x - cx) - sizeX / 2;
    float dy = abs(pos.y - cy) - sizeY / 2;
    float outdx = max(dx, 0);
    float outdy = max(dy, 0);
    float outDst = sqrt(outdx * outdx + outdy * outdy);
    float inDst = min(0, max(dx, dy));
    float rctDst = inDst + outDst;
    dst = min(dst, rctDst);
  }

  // Return distance
  return dst;
}

// #endregion
