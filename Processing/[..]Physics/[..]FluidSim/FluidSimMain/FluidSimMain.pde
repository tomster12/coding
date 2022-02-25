
// http://jamie-wong.com/2016/08/05/webgl-fluid-simulation/#the-velocity-field
// Pretends viscosity is 0
// Potentially redo in JS with light.js to use webGL and GPU


// #region - Setup

// Declare variables
color currentColor;
FluidField fluidField;


void setup() {
  size(800, 800, P2D);
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  currentColor = color(random(255), random(255), random(255));
  fluidField = new FluidField(
    new float[][] {
      new float[] {-1.0, 1.0},
      new float[] {-1.0, 1.0} },
    new Int2(200, 200),
    new Float2(50, 50),
    new Float2(700, 700)
  );
}

// #endregion


// #region - Main

void draw() {
  background(255);
  fluidField.update();
  fluidField.show();
}

// #endregion


// #region - Other

float mod(float val, float max) {
  // Safe mod function
  return (val + max) % max;
}


float bilInterp(float v0, float v1, float v2, float v3, float x, float y) {
  // Unit square bilinear interpolation
  // f(x, y) = f(0, 0)(1 - x)(1 - y)
  // + f(1, 0)(x)(1 - y)
  // + f(0, 1)(1 - x)(y)
  // + f(1, 1)(x)(y)
  return v0 * (1 - x) * (1 - y)
    + v1 * (x) * (1 - y)
    + v2 * (1 - x) * (y)
    + v3 * (x) * (y);
}


void mouseDragged() {
  // Get drag direction
  Float2 mousePos = new Float2(mouseX, mouseY);
  Float2 prevMousePos = new Float2(pmouseX, pmouseY);
  Float2 dir = mousePos.sub(prevMousePos);

  // Update fluidField vel
  Float2 screenPos = fluidField.constrainToScreen(mousePos);
  Float2 indPos = fluidField.getIndexFromScreen(screenPos);
  for (int x = 0; x < fluidField.samples.x; x++) {
    for (int y = 0; y < fluidField.samples.y; y++) {
      float dx = x - indPos.x;
      float dy = y - indPos.y;
      float indDistSq = dx * dx + dy * dy;
      if (indDistSq < 8 * 8) {
        if (mouseButton == LEFT) fluidField.col[y][x] = currentColor;
        if (mouseButton == CENTER) fluidField.col[y][x] = color(255);
        fluidField.vel[y][x] = fluidField.vel[y][x].add(dir.sub(fluidField.vel[y][x]).mult(0.1));
      }
    }
  }
}


void mouseReleased() {
  // Reset colour on mouse up
  currentColor = color(random(255), random(255), random(255));
}

// #endregion


class Float2 {

  // #region - Main

  float x, y;


  Float2(float x_, float y_) {
    x = x_;
    y = y_;
  }


  Float2 copy() {
    return new Float2(x, y);
  }


  float distSq() {
    return x * x + y * y;
  }


  float dist() {
    return sqrt(distSq());
  }


  Float2 add(Float2 other) {
    return new Float2(
      x + other.x,
      y + other.y
    );
  }


  Float2 sub(Float2 other) {
    return new Float2(
      x - other.x,
      y - other.y
    );
  }


  Float2 mult(float val) {
    return new Float2(
      x * val,
      y * val
    );
  }


  Float2 elMult(Float2 other) {
    return new Float2(
      x * other.x,
      y * other.y
    );
  }

  // #endregion
}


class Int2 {

  // #region - Main

  int x;
  int y;


  Int2(int x_, int y_) {
    x = x_;
    y = y_;
  }

  // #endregion
}


class FluidField {

  // #region - Setup

  // Declare variables
  float[][] domain;
  Int2 samples;
  Float2 drawPos;
  Float2 drawSize;
  Float2 drawScale;
  float eps;
  float dens;

  Float2[][] vel;
  color[][] col;
  float[][] div;
  float[][] prs;
  PImage output;


  FluidField(float[][] domain_, Int2 samples_, Float2 drawPos_, Float2 drawSize_) {
    // Initialize variables
    domain = domain_;
    samples = samples_;
    drawPos = drawPos_;
    drawSize = drawSize_;
    drawScale = new Float2(
      drawSize.x / samples.x,
      drawSize.y / samples.y);
    eps = (domain[0][1] - domain[0][0]) / samples.x;
    dens = 0.01;

    vel = new Float2[samples.y][samples.x];
    col = new color[samples.y][samples.x];
    div = new float[samples.y][samples.x];
    prs = new float[samples.y][samples.x];
    output = new PImage(samples.x, samples.y);

    // populate vel, col, div, prs
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        vel[y][x] = new Float2(0, 0);
        col[y][x] = color(255);
        div[y][x] = 0;
        prs[y][x] = 0;
      }
    }
  }

  // #endregion


  // #region - Main

  void update() {
    // Update fluid vel and col
    float dt = 1 / frameRate;
    advectVelWithVel(dt);
    calculateDivergence(dt);
    calculatePressure(dt);
    updateVelWithPrs(dt);
    advectColWithVel(dt);
  }


  void advectVelWithVel(float dt) {
    // col(p, t + dt) = col(p - u(p) * dt, t)
    Float2[][] nextVel = new Float2[samples.y][samples.x];
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        Float2 indPos = new Float2(x, y);
        Float2 fieldPos = getFieldFromIndex(indPos);
        Float2 fieldVel = velAtField(fieldPos);
        Float2 prevVel = velAtField(fieldPos.sub(fieldVel.mult(dt)));
        nextVel[y][x] = prevVel;
      }
    }

    // Update current vel
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        vel[y][x] = nextVel[y][x];
      }
    }
  }


  void calculateDivergence(float dt) {
    // Calculate divergence at each point
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        float curDiv = velAtIndex(x + 1, y).x;
        curDiv -= velAtIndex(x - 1, y).x;
        curDiv += velAtIndex(x, y + 1).y;
        curDiv -= velAtIndex(x, y - 1).y;
        curDiv *= -2 * eps * dens / dt;
        div[y][x] = curDiv;
      }
    }
  }


  void calculatePressure(float dt) {
    // Reset pressure
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        prs[y][x] = 0;
      }
    }

    // Iterate 10 times to get pressure
    float[][] nextPrs;
    for (int i = 0; i < 10; i++) {
      nextPrs = new float[samples.y][samples.x];
      for (int x = 0; x < samples.x; x++) {
        for (int y = 0; y < samples.y; y++) {
          float curPrs = divAtIndex(x, y);
          curPrs += prsAtIndex(x + 2, y);
          curPrs += prsAtIndex(x - 2, y);
          curPrs += prsAtIndex(x, y + 2);
          curPrs += prsAtIndex(x, y - 2);
          curPrs /= 4;
          nextPrs[y][x] = curPrs;
        }
      }
      prs = nextPrs;
    }
  }


  void updateVelWithPrs(float dt) {
    // Update the vel using prs
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        float prsDifx = prsAtIndex(x + 1, y);
        prsDifx -= prsAtIndex(x - 1, y);
        prsDifx *= dt / (2 * dens * eps);
        float prsDify = prsAtIndex(x, y + 1);
        prsDify -= prsAtIndex(x, y - 1);
        prsDify *= dt / (2 * dens * eps);
        vel[y][x].x -= prsDifx;
        vel[y][x].y -= prsDify;
      }
    }
  }


  void advectColWithVel(float dt) {
    // col(p, t + dt) = col(p - u(p) * dt, t)
    color[][] nextCol = new color[samples.y][samples.x];
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        Float2 indPos = new Float2(x, y);
        Float2 fieldPos = getFieldFromIndex(indPos);
        Float2 fieldVel = velAtField(fieldPos);
        color prevCol = colAtField(fieldPos.sub(fieldVel.mult(dt)));
        nextCol[y][x] = prevCol;
      }
    }

    // Update current col
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        col[y][x] = nextCol[y][x];
      }
    }
  }


  void show() {
    // Show samples
    output.loadPixels();
    for (int x = 0; x < samples.x; x++) {
      for (int y = 0; y < samples.y; y++) {
        output.pixels[x + y * samples.x] = col[y][x];
      }
    }
    output.updatePixels();
    image(output, drawPos.x, drawPos.y, drawSize.x, drawSize.y);
  }

  // #endregion


  // #region - Values

  Float2 velAtIndex(int ix, int iy) {
    // Get the vel at an index - handle out of bounds
    if (ix >= 0 && ix < samples.x
    && iy >= 0 && iy < samples.y) {
      return vel[iy][ix];
    } else return new Float2(0, 0);
  }


  color colAtIndex(int ix, int iy) {
    // Get a color at an index - handle out of bounds
    if (ix >= 0 && ix < samples.x
    && iy >= 0 && iy < samples.y) {
      return col[iy][ix];
    } else return color(255);
  }


  float divAtIndex(int ix, int iy) {
    // Get the div at an index - handle out of bounds
    if (ix >= 0 && ix < samples.x
    && iy >= 0 && iy < samples.y) {
      return div[iy][ix];
    } else return 0;
  }


  float prsAtIndex(int ix, int iy) {
    // Get the prs at an index - handle out of bounds
    if (ix >= 0 && ix < samples.x
    && iy >= 0 && iy < samples.y) {
      return prs[iy][ix];
    } else return 0;
  }


  Float2 velAtField(Float2 fieldPos) {
    // Get velocity in field terms at a position
    // Use bilinear interpolation with 4 nearest points
    Float2 indPos = getIndexFromField(fieldPos);
    int[] tlIndices = new int[] {floor(indPos.x), floor(indPos.y)};
    int[] trIndices = new int[] {ceil(indPos.x), floor(indPos.y)};
    int[] blIndices = new int[] {floor(indPos.x), ceil(indPos.y)};
    int[] brIndices = new int[] {ceil(indPos.x), ceil(indPos.y)};
    Float2 tlVal = velAtIndex(tlIndices[0], tlIndices[1]);
    Float2 trVal = velAtIndex(trIndices[0], trIndices[1]);
    Float2 blVal = velAtIndex(blIndices[0], blIndices[1]);
    Float2 brVal = velAtIndex(brIndices[0], brIndices[1]);
    float x = indPos.x - floor(indPos.x);
    float y = indPos.y - floor(indPos.y);
    return new Float2(
      bilInterp(tlVal.x, trVal.x, blVal.x, brVal.x, x, y),
      bilInterp(tlVal.y, trVal.y, blVal.y, brVal.y, x, y)
    );
  }


  color colAtField(Float2 fieldPos) {
    // Get colour at a position
    // Use bilinear interpolation with 4 nearest points
    Float2 indPos = getIndexFromField(fieldPos);
    int[] tlIndices = new int[] {floor(indPos.x), floor(indPos.y)};
    int[] trIndices = new int[] {ceil(indPos.x), floor(indPos.y)};
    int[] blIndices = new int[] {floor(indPos.x), ceil(indPos.y)};
    int[] brIndices = new int[] {ceil(indPos.x), ceil(indPos.y)};
    color tlVal = colAtIndex(tlIndices[0], tlIndices[1]);
    color trVal = colAtIndex(trIndices[0], trIndices[1]);
    color blVal = colAtIndex(blIndices[0], blIndices[1]);
    color brVal = colAtIndex(brIndices[0], brIndices[1]);
    float x = indPos.x - floor(indPos.x);
    float y = indPos.y - floor(indPos.y);
    return color(
      bilInterp(red(tlVal), red(trVal), red(blVal), red(brVal), x, y),
      bilInterp(green(tlVal), green(trVal), green(blVal), green(brVal), x, y),
      bilInterp(blue(tlVal), blue(trVal), blue(blVal), blue(brVal), x, y)
    );
  }

  // #endregion


  // #region - Position

  Float2 getFieldFromIndex(Float2 indPos) {
    // Get a point on the field from indices
    return new Float2(
      map(indPos.x, -0.5, samples.x - 0.5, domain[0][0], domain[0][1]),
      map(indPos.y, -0.5, samples.y - 0.5, domain[1][0], domain[1][1])
    );
  }

  Float2 getFieldFromScreen(Float2 screenPos) {
    // Get a point on the field from screen pos
    screenPos = constrainToScreen(screenPos);
    return new Float2(
      map(screenPos.x, drawPos.x, drawPos.x + drawSize.x, domain[0][0], domain[0][1]),
      map(screenPos.y, drawPos.y, drawPos.y + drawSize.y, domain[1][0], domain[1][1])
    );
  }


  Float2 getIndexFromField(Float2 fieldPos) {
    // Get indices position from field position
    return new Float2(
      map(fieldPos.x, domain[0][0], domain[0][1], -0.5, samples.x - 0.5),
      map(fieldPos.y, domain[1][0], domain[1][1], -0.5, samples.y - 0.5)
    );
  }

  Float2 getIndexFromScreen(Float2 screenPos) {
    // Get indicies position from position
    return new Float2(
      (screenPos.x - drawPos.x) / drawScale.x - 0.5,
      (screenPos.y - drawPos.y) / drawScale.y - 0.5
    );
  }


  Float2 getScreenFromField(Float2 fieldPos) {
    // Get a point on the screen from field position
    return new Float2(
      map(fieldPos.x, domain[0][0], domain[0][1], drawPos.x, drawPos.x + drawSize.x),
      map(fieldPos.y, domain[1][0], domain[1][1], drawPos.y, drawPos.y + drawSize.y)
    );
  }

  Float2 getScreenFromIndex(Float2 indPos) {
    // Get a point on the screen from indices
    return new Float2(
      drawPos.x + (indPos.x + 0.5) * drawScale.x,
      drawPos.y + (indPos.y + 0.5) * drawScale.y
    );
  }


  Float2 constrainToScreen(Float2 screenPos) {
    return new Float2(
      constrain(screenPos.x, drawPos.x, drawPos.x + drawSize.x),
      constrain(screenPos.y, drawPos.y, drawPos.y + drawSize.y)
    );
  }

  // #endregion
}
