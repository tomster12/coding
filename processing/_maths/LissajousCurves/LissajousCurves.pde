

// #region - Setup

float deltaTime;
float[][] guideCurves;
PVector startPos;
float size;
ArrayList<Curve> guideCurvesX;
ArrayList<Curve> guideCurvesY;
ArrayList<Curve> curves;


void setup() {
  size(600, 600);
  stroke(255);
  noFill();
  setupCurves();
}

void setupCurves() {
  guideCurves = new float[][] {
    {3, 2, 1, 1 / 2.0, 1 / 3.0, 1 / 4.0},
    {3, 2, 1, 1 / 2.0, 1 / 3.0, 1 / 4.0},
  };
  startPos = new PVector(0, 0);
  size = 80;
  guideCurvesX = new ArrayList<Curve>();
  guideCurvesY = new ArrayList<Curve>();
  curves = new ArrayList<Curve>();


  for (int x = 0; x < guideCurves[0].length; x++) {
    guideCurvesX.add(new Curve(
      new PVector(startPos.x + size/2 + (x+1)*size, startPos.y + size/2),
      size*0.8,
      true,
      guideCurves[0][x],
      guideCurves[0][x]
    ));
  }
  for (int y = 0; y < guideCurves[1].length; y++) {
    guideCurvesY.add(new Curve(
      new PVector(startPos.x + size/2, startPos.y + size/2 + (y+1)*size),
      size*0.8,
      true,
      guideCurves[1][y],
      guideCurves[1][y]
    ));
    for (int x = 0; x < guideCurves[0].length; x++) {
      curves.add(new Curve(
        new PVector(startPos.x + size/2 + size*(x+1), startPos.y + size/2 + (y+1)*size),
      size*0.8,
        false,
        x,
        y
      ));
    }
  }
}

// #endregion


// #region - Update

void draw() {
  background(0);
  deltaTime = 1/120.0;

  for (Curve c : guideCurvesX) {
    c.update();
  }
  for (Curve c : guideCurvesY) {
    c.update();
  }
  for (Curve c : curves) {
    c.update();
  }
}

// #endregion


class Curve {

  // #region - Setup

  PVector pos;
  float radius;
  boolean guide;
  float xP;
  float yP;
  int iX;
  int iY;

  PVector pointDir;
  ArrayList<PVector> pointPath;


  Curve(PVector pos_, float radius_, boolean guide_, float x, float y) {
    pos = pos_;
    radius = radius_;
    guide = guide_;
    if (guide) {
      xP = x;
      yP = y;
    } else {
      iX = (int)x;
      iY = (int)y;
    }

    pointDir = new PVector(0, 0);
    pointPath = new ArrayList<PVector>();
  }

  // #endregion


  // #region - Update

  void update() {
    updatePointDir();
    show();
  }


  void updatePointDir() {
    if (guide) {
      pointDir.x = radius/2 * cos(frameCount*TWO_PI*deltaTime*xP);
      pointDir.y = radius/2 * sin(frameCount*TWO_PI*deltaTime*yP);
    } else {
      pointDir.x = guideCurvesX.get(iX).pointDir.x;
      pointDir.y = guideCurvesY.get(iY).pointDir.y;
    }
    if (frameCount*deltaTime*xP < 1); {
      pointPath.add(pointDir.copy());
    }
  }


  void show() {
    ellipse(pos.x + pointDir.x, pos.y + pointDir.y, 5, 5);
    beginShape();
    for (int i = 0; i < pointPath.size(); i++) {
      PVector p = pointPath.get(i);
      vertex(pos.x + p.x, pos.y + p.y);
    }
    endShape();
  }

  // #endregion
}
