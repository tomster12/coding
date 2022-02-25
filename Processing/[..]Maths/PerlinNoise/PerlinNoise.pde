
// #region - Setup

float scale;
float xScale, yScale;
PVector[][] directions;
ArrayList<Point> points;


void setup() {
  size(800, 800);
  background(255);
  stroke(0, 10);
  setupVariables();
  setupField();
}


void setupVariables() {
  scale = 200;
  xScale = scale/500;
  yScale = scale/500;
  directions = new PVector[(int)(width/scale)][(int)(width/scale)];
  points = new ArrayList<Point>();
  for (int i = 0; i < 10000; i++) points.add(new Point());
}


void setupField() {
  for (int x = 0; x < width/scale; x++) {
    for (int y = 0; y < height/scale; y++) {
      float r = noise(x*xScale, y*yScale)*TWO_PI;
      PVector dir = new PVector(cos(r), sin(r));
      directions[x][y] = dir;
    }
  }
}

// #endregion


// #region - Main

void draw() {
  updatePoints();
}


void updatePoints() {
  for (Point p : points) {
    p.update();
  }
}

// #endregion


class Point {
  // #region - Setup

  PVector prevPos;
  PVector pos;
  PVector vel;
  PVector acc;


  Point() {
    prevPos = new PVector(random(width), random(height));
    pos = prevPos.copy();
    vel = new PVector(0, 0);
    acc = new PVector(0, 0);
  }

  // #endregion


  // #region - Main

  void update() {
    pos.x = (width + pos.x) % width;
    pos.y = (height + pos.y) % height;

    int x = floor(pos.x/scale);
    int y = floor(pos.y/scale);
    PVector acc = directions[x][y].copy().mult(0.2);

    prevPos = pos.copy();
    vel.add(acc);
    vel.limit(1);
    pos.add(vel);
    line(prevPos.x, prevPos.y, pos.x, pos.y);
  }

  // #endregion
}
