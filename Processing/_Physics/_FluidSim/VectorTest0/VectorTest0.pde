
// #region - Setup

// Declare the variables
boolean inputMouse;
int size;
float scale;
Float2[][] vectorField;
ArrayList<Point> points;


void setup() {
  size(700, 700, P2D);
  setupVariables();
}


void setupVariables() {
  // Initialize the variables
  inputMouse = false;
  size = 40;
  scale = (float)min(width, height) / size;
  vectorField = new Float2[size][size];
  points = new ArrayList<Point>();

  // Populate vector field
  for (int x = 0; x < size; x++) {
    for (int y = 0; y < size; y++) {
      float angle = noise(x * 10.0 / size, y * 10.0 / size) * TWO_PI;
      float dx = cos(angle);
      float dy = sin(angle);
      vectorField[y][x] = new Float2(dx, dy);
    }
  }
}

// #endregion


// #region - Main

void draw() {
  background(220);
  updatePoints();
  showVectorField();
  showPoints();
}


void updatePoints() {
  // Add new points at mouse
  if (inputMouse)
    points.add(new Point(new Float2(mouseX, mouseY)));

  // Update all points
  for (int i = points.size() - 1; i >= 0; i--)
    points.get(i).update();
}


void showVectorField() {
  // Draw vector field
  stroke(0);
  noFill();
  for (int x = 0; x < size; x++) {
    for (int y = 0; y < size; y++) {

      // Draw bounding box
      float px = x * scale;
      float py = y * scale;
      float s = scale;
      rect(px, py, s, s);

      // Draw direction
      float cx = px + s * 0.5;
      float cy = py + s * 0.5;
      float dx = map(vectorField[y][x].x, -1, 1, -s * 0.5, s * 0.5);
      float dy = map(vectorField[y][x].y, -1, 1, -s * 0.5, s * 0.5);
      line(cx, cy, cx + dx, cy + dy);
    }
  }
}


void showPoints() {
  // Draw points
  for (Point point : points)
    point.show();
}


void mousePressed() {
  inputMouse = true;
}


void mouseReleased() {
  inputMouse = false;
}

// #endregion


class Point {

  // #region - Main

  Float2 pos;
  Float2 vel;
  int time;
  ArrayList<Float2> path;


  Point(Float2 pos_) {
    pos = pos_;
    vel = new Float2(0, 0);
    time = 0;
    path = new ArrayList<Float2>();
  }


  void update() {
    // Draw points
    pos.x = constrain(pos.x, 5, size * scale - 5);
    pos.y = constrain(pos.y, 5, size * scale - 5);
    int gx = floor(pos.x / scale);
    int gy = floor(pos.y / scale);
    float accx = vectorField[gy][gx].x;
    float accy = vectorField[gy][gx].y;

    // Apply accel and vel
    vel.x += accx * 0.1;
    vel.y += accy * 0.1;
    pos.x += vel.x;
    pos.y += vel.y;
    vel.x *= 0.95;
    vel.y *= 0.95;

    // Update time
    time++;
    if (time > 60 * 8)
      points.remove(this);

    // Update path
    if (frameCount % 5 == 0)
      path.add(pos.copy());
    if (path.size() > 200)
      path.remove(0);
  }


  void show() {
    // Show as an ellipse
    noStroke();
    fill(0);
    ellipse(pos.x, pos.y, 4, 4);

    // Show path
    stroke(0);
    noFill();
    if (path.size() > 1) {
      for (int i = 0; i < path.size() - 1; i++)
        line(path.get(i).x, path.get(i).y, path.get(i + 1).x, path.get(i + 1).y);
    }
  }

  // #endregion
}


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

  // #endregion
}
