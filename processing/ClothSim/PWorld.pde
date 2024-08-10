
class PWorld {

  // Constants
  float DRAG = 0.05;
  float GRAVITY_ACC = 30;
  float INTERACT_DIST = 50;
  float INTERACT_FORCE = 25;


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
