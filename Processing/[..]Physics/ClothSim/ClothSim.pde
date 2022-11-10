
// Constants
float DT_MULT = 3;
float DRAG = 0.05;
float GRAVITY_ACC = 30;
float INTERACT_DIST = 50;
float INTERACT_FORCE = 25;
float NOISE_X_POS_MULT = 0.01;
float NOISE_Y_POS_MULT = 0.01;
float NOISE_X_TIME_MULT = 0.01;
float NOISE_Y_TIME_MULT = 0.01;
float WIND_FORCE = 0;

// Globals
PWorld PWORLD;
float DT;


void setup() {
  size(1400, 800);
  rectMode(CENTER);
  PWORLD = new PWorld();
  new Cloth(100, 50, 32, 120, 10);
}


void draw() {
  background(17, 15, 18);
  DT = DT_MULT / frameRate;
  PWORLD.draw();
}


class Cloth {

  int rows, cols;
  PWorld.PPoint[][] points;
  ArrayList<PWorld.PStick> sticks;


  Cloth(int px, int py, int rows, int cols, float scaling) {
    this.rows = rows;
    this.cols = cols;
    
    points = new PWorld.PPoint[cols][rows];    
    for (int x = 0; x < cols; x++) {
      for (int y = 0; y < rows; y++) {
        points[x][y] = PWORLD.addPoint(px + x * scaling, py + y * scaling, 1);
        if (x % 2 == 0 && y == 0) points[x][y].pin();
      }
    }
    // points[0][0].pin();
    // points[cols - 1][0].pin();

    sticks = new ArrayList<PWorld.PStick>();
    for (int x = 0; x < cols; x++) {
      for (int y = 0; y < rows; y++) {
        if (x < cols - 1) sticks.add(PWORLD.addStick(points[x][y], points[x + 1][y]));
        if (y < rows - 1) sticks.add(PWORLD.addStick(points[x][y], points[x][y + 1]));
      }
    }
  }
}


class PWorld {

  // #region - Classes

  class PPoint {

    float posX, posY, prevX, prevY, pinX, pinY, accX, accY;
    float mass;
    boolean isPinned, isHovered;

    PPoint(float posX, float posY, float mass) {
      this.posX = posX;
      this.posY = posY;
      this.prevX = posX;
      this.prevY = posY;
      this.mass = mass;
    }

    void pin() { isPinned = true; pinX = posX; pinY = posY; }
    void unpin() { isPinned = false; }
  }

  class PStick {

    PPoint a, b;
    float length;

    PStick(PPoint a, PPoint b) {
      this.a = a;
      this.b = b;
      this.length = dist(a.posX, a.posY, b.posX, b.posY);
    }
  }
  

  PPoint addPoint(float posX, float posY, float mass) {
    PPoint p = new PPoint(posX, posY, mass);
    points.add(p);
    return p;
  }

  PStick addStick(PPoint a, PPoint b) {
    PStick s = new PStick(a, b);
    sticks.add(s);
    return s;
  }

  // #endregion


  // #region - Main
  
  ArrayList<PPoint> points = new ArrayList<PPoint>();
  ArrayList<PStick> sticks = new ArrayList<PStick>();


  void draw() {
    update();
    show();
  }

  void update() {
    updateForce();
    updatePoints();
    updateSticks();
  }

  void show() {
    showPoints();
    showSticks();
  }

  // #endregion


  // #region - Update

  void updateForce() {
    // Calculate mouseForce
    float mouseForceX = (mouseX - pmouseX) * INTERACT_FORCE;
    float mouseForceY = (mouseY - pmouseY) * INTERACT_FORCE;
    
    // Update all points
    for (PPoint p : points) {

      // Add gravity
      p.accX = 0;
      p.accY = 0;
      p.accY += GRAVITY_ACC;

      // Add wind force
      // float r = noise(
      //   p.posX * NOISE_X_POS_MULT + frameCount * NOISE_X_TIME_MULT,
      //   p.posY * NOISE_Y_POS_MULT + frameCount * NOISE_Y_TIME_MULT
      // );
      // float windForceX = cos(r * 2 * PI) * WIND_FORCE;
      // float windForceY = sin(r * 2 * PI) * WIND_FORCE;
      // p.accX += windForceX / p.mass;
      // p.accY += windForceY / p.mass;

      // Add mouse force
      float mouseDiffX = mouseX - p.posX;
      float mouseDiffY = mouseY - p.posY;
      float mouseDist = sqrt(mouseDiffX * mouseDiffX + mouseDiffY * mouseDiffY);
      if (mouseDist < INTERACT_DIST) {
        p.isHovered = true;
        if (mousePressed) {
          p.accX += (mouseForceX / p.mass) * (1 - mouseDist / INTERACT_DIST);
          p.accY += (mouseForceY / p.mass) * (1 - mouseDist / INTERACT_DIST);
        }
      } else p.isHovered = false;
    }
  }

  void updatePoints() {
    // Update all points
    for (PPoint p : points) {

      // Lock in place
      if (p.isPinned) {
        p.posX = p.pinX;
        p.posY = p.pinY;
      }

      // Verlet integration
      float prevX = p.posX;
      float prevY = p.posY;
      p.posX = p.posX + (p.posX - p.prevX) * (1.0 - DRAG) + p.accX * (1.0 - DRAG) * DT * DT;
      p.posY = p.posY + (p.posY - p.prevY) * (1.0 - DRAG) + p.accY * (1.0 - DRAG) * DT * DT;
      p.prevX = prevX;
      p.prevY = prevY;
    }
  }

  void updateSticks() {
    // Remove sticks
    for (int i = 0; i < sticks.size(); i++) {
      if (mousePressed && mouseButton == RIGHT) {
        if (sticks.get(i).a.isHovered || sticks.get(i).b.isHovered) {
          sticks.remove(i);
          i--;
        }
      }
    }

    // Update each stick
    for (PStick s : sticks) {

      // Keep points at correct length
      float diffX = s.b.posX - s.a.posX;
      float diffY = s.b.posY - s.a.posY;
      float dst = sqrt(diffX * diffX + diffY * diffY);
      float diffFactor = (s.length - dst) / dst * 0.5;
      s.a.posX -= diffX * diffFactor;
      s.a.posY -= diffY * diffFactor;
      s.b.posX += diffX * diffFactor;
      s.b.posY += diffY * diffFactor;
    }
  }

  // #endregion


  // #region - Render

  void showPoints() {
    fill(255);
    noStroke();
    for (PPoint p : points) {
      ellipse(p.posX, p.posY, 5, 5);
    }
  }

  void showSticks() {
    stroke(255);
    for (PStick s : sticks) {
      line(s.a.posX, s.a.posY, s.b.posX, s.b.posY);
    }
  }

  // #endregion
}
