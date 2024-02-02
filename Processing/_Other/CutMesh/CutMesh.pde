
// #region - Setup

ArrayList<Object> objects;
PVector cutStart;

void setup() {
  fullScreen();
  rectMode(CENTER);
  setupVariables();
}


void setupVariables() {
  objects = new ArrayList<Object>();
  objects.add(new Object(
    new PVector(width/2, height/2),
    new PVector[] {
      new PVector(-100, -50),
      new PVector(100, -50),
      new PVector(100, 50),
      new PVector(-100, 50)
    }
  ));
}

// #endregion


// #region - Main

void draw() {
  background(0);
  updateObjects();
  updateInput();
}


void updateObjects() {
  for (int i = objects.size()-1; i >= 0; i--) {
    objects.get(i).update();
  }
  text(objects.size(), width/2, 50);
  text((int)frameRate, width/2, 70);
}


void updateInput() {
  if (cutStart != null) {
    stroke(255);
    PVector p = getMousePos();
    line(cutStart.x, cutStart.y, p.x, p.y);
    for (Object obj : objects) {
      obj.callCut(new PVector[] {cutStart, p}, true);
    }
  }

  for (Object obj : objects) {
    if (mousePressed && mouseButton == RIGHT) {
      if (dist(mouseX, mouseY, obj.pos.x, obj.pos.y) < 100) {
        obj.grabbed = true;
      }
    } else {
      obj.grabbed = false;
    }
  }
}

// #endregion


// #region - Input

void mousePressed() {
  if (mouseButton == LEFT) {
    cutStart = getMousePos();
  }
}


void mouseReleased() {
  if (cutStart != null) {
    for (int i = objects.size()-1; i >= 0; i--) {
      objects.get(i).callCut(new PVector[] {cutStart, getMousePos()}, false);
    }
    cutStart = null;
  }
}



void mouseWheel(MouseEvent event) {
  float e = event.getCount();
  for (Object obj : objects) {
    if (e>=0) {
      PVector dir = obj.pos.copy() .sub(getMousePos()) .mult(0.05);
      dir.setMag(dir.mag()>20?20:dir.mag());
      obj.applyForce(dir);
    } else {
      PVector dir = getMousePos() .sub(obj.pos.copy()) .mult(0.05);
      dir.setMag(dir.mag()>20?20:dir.mag());
      obj.applyForce(dir);
    }
  }
}


PVector getMousePos() {
  return new PVector(mouseX, mouseY);
}


void keyPressed() {
  if (keyCode == 9) {
    for (Object obj : objects) {
      obj.pos = new PVector(
        random(width),
        random(height)
      );
    }
  }
}

// #endregion


// #region - Other

PVector vecNorm(PVector vec) {
  return new PVector(-vec.y, vec.x);
}


PVector getIntersect(PVector[] l1, PVector[] l2) {
  double a1 = l1[1].y-l1[0].y;
  double b1 = l1[0].x-l1[1].x;
  double c1 = a1*l1[0].x+b1*l1[0].y;
  double a2 = l2[1].y-l2[0].y;
  double b2 = l2[0].x-l2[1].x;
  double c2 = a2*l2[0].x+b2*l2[0].y;

  double determinant = a1*b2-a2*b1;
  if (determinant==0) return null;
  double px = (b2*c1 - b1*c2)/determinant;
  double py = (a1*c2 - a2*c1)/determinant;

  boolean valid = true
  && px >= min(l1[0].x, l1[1].x)
  && px <= max(l1[0].x, l1[1].x)
  && py >= min(l1[0].y, l1[1].y)
  && py <= max(l1[0].y, l1[1].y)
  && px >= min(l2[0].x, l2[1].x)
  && px <= max(l2[0].x, l2[1].x)
  && py >= min(l2[0].y, l2[1].y)
  && py <= max(l2[0].y, l2[1].y);
  if (!valid) return null;
  return new PVector((float)px, (float)py);
}

// #endregion


class Object {
  // #region - Setup

  PVector pos;
  PVector vel;
  PVector acc;
  PVector[] points;
  boolean grabbed;


  Object(PVector pos_, PVector[] points_) {
    pos = pos_;
    vel = new PVector(0, 0);
    acc = new PVector(0, 0);
    points = points_;
  }

  // #endregion


  // #region - Main

  void update() {
    movement();
    show();
  }


  void movement() {
    updateGrabbed();
    applyForce(vel.copy().mult(-0.05));
    vel.add(acc);
    pos.add(vel);
    acc.mult(0);
  }


  void updateGrabbed() {
    if (grabbed) applyForce(getMousePos().sub(pos).mult(0.02));
  }


  void show() {
    fill(200);
    noStroke();
    beginShape();
    PVector[] np = truePoints();
    for (PVector p : np) {
      vertex(p.x, p.y);
    }
    endShape();
  }

  // #endregion


  // #region - Cut

  void callCut(PVector[] l1, boolean show) {
    PVector[] np = truePoints();
    ArrayList<float[]> intersections = new ArrayList<float[]>();
    for (int i = 0; i < np.length; i++) {
      PVector[] l2 = new PVector[] {np[i], np[(i+1)%np.length]}; // Check each side
      PVector is = getIntersect(l1, l2);

      if (is != null) {
        if (show) {ellipse(is.x, is.y, 5, 5); // Show if needed

        } else {
          PVector dir1 = l2[1].copy().sub(l2[0]); // Get position on side
          PVector dir2 = is.copy().sub(l2[0]);
          float amount = dir2.mag() / dir1.mag();
          intersections.add(new float[] {i, (i+1)%np.length, amount});
        }
      }
    }

    if (intersections.size() == 2 && !show) { // Cut if 2 intersections
      cut(intersections.get(0), intersections.get(1));
    }
  }


  void cut(float[] is1, float[] is2) {
    PVector[] np = truePoints(); // Get positions of intersections
    ArrayList<PVector> p1 = new ArrayList<PVector>();
    ArrayList<PVector> p2 = new ArrayList<PVector>();
    PVector is1p = np[(int)is1[0]].copy() .add(np[(int)is1[1]].copy() .sub(np[(int)is1[0]]) .mult(is1[2]));
    PVector is2p = np[(int)is2[0]].copy() .add(np[(int)is2[1]].copy() .sub(np[(int)is2[0]]) .mult(is2[2]));
    PVector ism = is2p.copy() .add(is1p) .div(2);


    p1.add(is1p);
    for (float ci = is1[1]; ci != (is2[0]+1)%np.length; ci = (ci+1)%np.length) { // Get points of each shape
      p1.add(np[(int)ci]);
    }
    p1.add(is2p);
    p2.add(is2p);
    for (float ci = is2[1]; ci != (is1[0]+1)%np.length; ci = (ci+1)%np.length) {
      p2.add(np[(int)ci]);
    }
    p2.add(is1p);


    PVector p1p = new PVector(0, 0); // Get positions of each shape
    for (PVector p : p1) p1p.add(p);
    p1p.div(p1.size());

    PVector p2p = new PVector(0, 0);
    for (PVector p : p2) p2p.add(p);
    p2p.div(p2.size());


    PVector[] p1a = new PVector[p1.size()]; // Get corrected points of each shape
    for (int i = 0; i < p1.size(); i++) {
      p1a[i] = p1.get(i).copy() .sub(pos) .add(pos.copy() .sub(p1p));
    }
    PVector[] p2a = new PVector[p2.size()];
    for (int i = 0; i < p2.size(); i++) {
      p2a[i] = p2.get(i).copy() .sub(pos) .add(pos.copy() .sub(p2p));
    }


    PVector dir1 = p1p.copy() .sub(ism) .normalize(); // Create shapes and move
    Object o1 = new Object(p1p, p1a);
    o1.applyForce(dir1.mult(0.2));
    objects.add(o1);

    PVector dir2 = p2p.copy() .sub(ism) .normalize();
    Object o2 = new Object(p2p, p2a);
    o2.applyForce(dir2.mult(0.2));
    objects.add(o2);
    objects.remove(this);
  }

  // #endregion


  // #region - Other

  void applyForce(PVector force) {
    acc.add(force);
  }


  PVector[] truePoints() {
    PVector[] np = new PVector[points.length];
    for (int i = 0; i < points.length; i++) {
      PVector p = points[i];
      np[i] = new PVector(pos.x + p.x, pos.y + p.y);
    }
    return np;
  }

  // #endregion
}
