

class object {


  PVector pos;
  float size;
  ArrayList<PVector> tail;
  int tailLength;
  float mass;

  PVector vel;
  PVector acc;
  PVector collisionAcc;
  boolean collided;

  float colour;




  object(PVector pos_, float size_) {
    pos = pos_;
    size = size_;

    tail = new ArrayList<PVector>();
    tailLength = 50;
    mass = (size * size) / 100;
    vel = new PVector(0, 0);

    setupVariables();
  }


  object(PVector pos_, float size_, PVector vel_) {
    pos = pos_;
    size = size_;
    vel = vel_;

    tail = new ArrayList<PVector>();
    tailLength = 50;
    mass = (size * size) / 100;

    setupVariables();
  }


  void setupVariables() {
    acc = new PVector(0, 0);
    collisionAcc = new PVector(0, 0);
    collided = false;
    colour = random(150, 240);
  }




  void gravity() {
    if (attractToOther) {
      for (int i = 0; i < objects.size(); i++) {
        object obj = objects.get(i);
        PVector force = obj.pos.copy().sub(this.pos);
        float magnitude = (size * obj.size) / constrain(force.magSq(), gravityLimits[0], gravityLimits[1]);
        force.setMag(magnitude * forceMultiplier / updatesPerFrame);
        acc.add(force);
      }
    }
    if (attractToGravity) {
      for (int i = 0; i < gravitySources.size(); i++) {
        gravitySource gs = gravitySources.get(i);
        PVector force = gs.pos.copy().sub(this.pos);
        float magnitude = (size * gs.size) / constrain(force.magSq(), gravityLimits[0], gravityLimits[1]);
        force.setMag(magnitude * forceMultiplier / updatesPerFrame);
        acc.add(force);
      }
    }
  }


  void movement() {
    vel.add(this.acc);
    pos.add(this.vel);
    acc.mult(0);
    collisionAcc.mult(0);

    tail.add(pos.copy());
    if (tail.size() > tailLength) {
      tail.remove(0);
    }

    collided = false;
  }


  void collisions() {
    for (int i = 0; i < objects.size(); i++) { // For every other object
      object obj = objects.get(i);
      if (obj != this) { // If a different object
        if (dist(pos.x, pos.y, obj.pos.x, obj.pos.y) < (size / 2) + (obj.size / 2)) { // If overlapping
          collided = true;

          float m1 = mass;
          float m2 = obj.mass;
          PVector v1 = vel.copy();
          PVector v2 = obj.vel.copy();
          PVector p1 = pos.copy();
          PVector p2 = obj.pos.copy();

          // Get velocity of ball along normal line
          PVector unitNormal = p2.sub(p1).normalize();
          float vN1 = v1.dot(unitNormal);
          float vN2 = v2.dot(unitNormal);

          // Get velocity of ball along tangent line
          PVector unitTangent = new PVector(-unitNormal.y, unitNormal.x);
          float vT1 = v1.dot(unitTangent);

          // Do 1D collision calculation along normal line
          float nVN1 = (vN1 * (m1 - m2) + (2 * m2 * vN2)) / (m1 + m2);

          // Sum tangent and calculated normal vectors together
          PVector cV = ((unitNormal.mult(nVN1)).add(unitTangent.mult(vT1))).sub(vel);
          collisionAcc.add(cV);

          //http://www.phy.ntnu.edu.tw/ntnujava/index.php?topic=4
        }
      }
    }

    if (pos.x - size / 2 < 0) {
      vel.x = -vel.x;
    }
    if (pos.x + size / 2 > width) {
      vel.x = -vel.x;
    }
    if (pos.y - size / 2 < 0) {
      vel.y = -vel.y;
    }
    if (pos.y + size / 2 > height) {
      vel.y = -vel.y;
    }
  }


  void collisionCorrection() {
    if (collided) {
      vel.add(collisionAcc);
      pos.add(collisionAcc);
    }
  }


  void show() {
    noStroke();
    fill(colour);
    ellipse(pos.x, pos.y, size, size);

    if (showDirection) {
      stroke(255);
      line(pos.x, pos.y, pos.x + vel.x*8, pos.y + vel.y*8);
    }

    if (showTrails) {
      noStroke();

      if (tail.size() > 0) {
        beginShape();
        vertex(tail.get(0).x, tail.get(0).y);
        for (int i = 0; i < tail.size() - 1; i++) { // Go through the tail from the back
          PVector dir = tail.get(i + 1).copy().sub(tail.get(i));
          PVector pDir = new PVector(dir.y, -dir.x); // Get perpendicular
          pDir.setMag((size * (i + 1) / tail.size()) / 2); // Scale for size
          ellipse(tail.get(i + 1).x + pDir.x, tail.get(i + 1).y + pDir.y, 1, 1);
          vertex(tail.get(i + 1).x + pDir.x, tail.get(i + 1).y + pDir.y); // Place point at distance from next point in perpendicular direction
        }
        for (int i = tail.size() - 1; i > 0; i--) {
          PVector dir = tail.get(i - 1).copy().sub(tail.get(i));
          PVector pDir = new PVector(dir.y, -dir.x); // Perpendicular
          pDir.setMag((size * (i - 1) / tail.size()) / 2); // Scale for size
          ellipse(tail.get(i - 1).x + pDir.x, tail.get(i - 1).y + pDir.y, 1, 1);
          vertex(tail.get(i - 1).x + pDir.x, tail.get(i - 1).y + pDir.y); // Place point at distance from next point in perpendicular direction
        }
        endShape();

        for (int i = 0; i < tail.size(); i++) {
          float s = size * i / tail.size();
          ellipse(tail.get(i).x, tail.get(i).y, s, s);
        }
      }
    }
  }
}
