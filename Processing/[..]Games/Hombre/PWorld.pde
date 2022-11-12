
class PWorld {

  float drag;
  float gravityAcc;


  // #region - Classes

  class PPoint {

    float posX, posY, prevX, prevY, pinX, pinY, accX, accY;
    float mass;
    boolean isPinned;

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


  PWorld() {
    this.drag = 0.05;
    this.gravityAcc = 500;
  }

  PWorld(float drag, float gravityAcc) {
    this.drag = drag;
    this.gravityAcc = gravityAcc;
  }


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
    // Update all points
    for (PPoint p : points) {

      // Lock in place
      if (p.isPinned) {
        p.posX = p.pinX;
        p.posY = p.pinY;
      }

      // Add gravity
      p.accX = 0;
      p.accY = 0;
      p.accY += gravityAcc;
    }
  }

  void updatePoints() {
    // Update all points
    for (PPoint p : points) {

      // Verlet integration
      float prevX = p.posX;
      float prevY = p.posY;
      p.posX = p.posX + (p.posX - p.prevX) * (1.0 - drag) + p.accX * (1.0 - drag) * DT * DT;
      p.posY = p.posY + (p.posY - p.prevY) * (1.0 - drag) + p.accY * (1.0 - drag) * DT * DT;
      p.prevX = prevX;
      p.prevY = prevY;
    }
  }

  void updateSticks() {
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
