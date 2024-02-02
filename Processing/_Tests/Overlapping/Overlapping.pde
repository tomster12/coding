
// #region - Setup

PVector[] l1;
PVector[] cl;
PVector p;


void setup() {
  size(600, 600);
  l1 = new PVector[] {
    new PVector(200, 340),
    new PVector(400, 260)
  };
}

// #endregion


// #region - Main

void draw() {
  background(0);
  stroke(255);
  noFill();

  line(l1[0].x, l1[0].y, l1[1].x, l1[1].y);
  if (p != null) ellipse(p.x, p.y, 5, 5);
  if (cl != null) {
    line(cl[0].x, cl[0].y, cl[1].x, cl[1].y);
    p = getIntersect(l1, cl);
    cl[1] = getMousePos();
  }
}


PVector getIntersect(PVector[] l1, PVector[] l2) {
  float a1 = l1[1].y-l1[0].y;
  float b1 = l1[0].x-l1[1].x;
  float c1 = a1*l1[0].x+b1*l1[0].y;
  float a2 = l2[1].y-l2[0].y;
  float b2 = l2[0].x-l2[1].x;
  float c2 = a2*l2[0].x+b2*l2[0].y;

  float determinant = a1*b2-a2*b1;
  if (determinant==0) return null;
  float px = (b2*c1 - b1*c2)/determinant;
  float py = (a1*c2 - a2*c1)/determinant;

  boolean valid = true;
  valid = px >= min(l1[0].x, l1[1].x)
  && px <= max(l1[0].x, l1[1].x)
  && py >= min(l1[0].y, l1[1].y)
  && py <= max(l1[0].y, l1[1].y)
  && px >= min(l2[0].x, l2[1].x)
  && px <= max(l2[0].x, l2[1].x)
  && py >= min(l2[0].y, l2[1].y)
  && py <= max(l2[0].y, l2[1].y);
  if (!valid) return null;
  return new PVector(px, py);
}

// #endregion


// #region - Input

void mousePressed() {
  PVector mousePos = new PVector(mouseX, mouseY);
  cl = new PVector[2];
  cl[0] = mousePos;
  cl[1] = mousePos;
}


void mouseReleased() {
  cl = null;
}


PVector getMousePos() {
  return new PVector(mouseX, mouseY);
}

// #endregion
