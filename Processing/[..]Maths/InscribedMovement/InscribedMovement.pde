// #region - Setup

float radius;
float speed;
PVector pos;

color[] cols;
int[] shapeSizes;
ArrayList<Shape> shapes;


void setup() {
  size(600, 600);
  stroke(255);
  noFill();
  setupVariables();
}


void setupVariables() {
  radius = 120;
  speed = 0.03;
  pos = new PVector(300, 300);

  color col1 = color(50, 50, 200);
  color col2 = color(200, 20, 150);
  cols = new color[6];
  for (int i = 0; i < cols.length; i++) {
    cols[i] = lerpColor(col1, col2, i/(float)(cols.length-1));
  }
  shapeSizes = new int[] {3, 4, 6, 8, 12, 16};
  shapes = new ArrayList<Shape>();
  for (int i = 0; i < shapeSizes.length; i++) {
  shapes.add(new Shape(
      pos,
      radius,
      speed,
      0,
      shapeSizes[i],
      cols[i]
    ));
  }
}

// #endregion


// #region - Update Functions

void draw() {
  background(0);
  updateShapes();
  drawOther(60);
}


void updateShapes() {
  for (Shape s : shapes) {
    s.update();
  }
}


void drawOther(int amount) {
  stroke(255);
  noFill();
  ellipse(pos.x, pos.y, radius, radius);

  PVector p1 = new PVector(50, 500);
  float eX = 550;
  float xDif = (eX - p1.x) * 1/(amount-1);
  float size = (eX - p1.x) / amount;

  stroke(255);
  noFill();
  PVector pp = new PVector(p1.x + (size*frameCount*speed) % eX, p1.y-(shapeSizes.length+1)*size);
  ellipse(pp.x, pp.y, size/2, size/2);

  for (int i = 0; i < amount; i++) {
    PVector p3 = new PVector(p1.x + xDif * i, p1.y);
    stroke(255);
    noFill();
    ellipse(p3.x, p3.y, size, size);

    for (int o = 0; o < shapeSizes.length; o++) {
      if (i % shapeSizes[o] == 0) {
        noStroke();
        fill(cols[o]);
        ellipse(p3.x, p3.y - (o+1)*size, size, size);
      }
    }
  }
}

// #endregion


class Shape {
  // #region - Setup

  PVector pos;
  float radius;
  float speed;
  float point;
  PVector[] points;
  color col;


  Shape(PVector pos_, float radius_, float speed_, float point_, int pointAmount, color col_) {
    pos = pos_;
    radius = radius_;
    speed = speed_;
    point = point_;
    generatePoints(pointAmount);
    col = col_;
  }


  void generatePoints(int pointAmount) {
    float ad = TWO_PI / pointAmount;
    float ao = pointAmount/2.0 -  pointAmount/2 - 0.5;
    points = new PVector[pointAmount];
    for (int i = 0; i < pointAmount; i++) {
      float a = i*ad - PI/2;
      points[i] = new PVector(pos.x + cos(a) * radius/2, pos.y + sin(a) * radius/2);
    }
  }

  // #endregion


  // #region - Update Functions

  void update() {
    movement();
    show();
  }


  void movement() {
    point += speed;
    point = point % points.length;
}


  void show() {
    for (int i = 0; i < points.length; i++) {
      stroke(col);
      noFill();
      PVector p1 = points[i];
      PVector p2 = points[(i+1)%points.length];
      line(p1.x, p1.y, p2.x, p2.y);

      if ((int)point == i) {
        stroke(255);
        noFill();
        PVector dir = p2.copy().sub(p1);
        dir.mult(point - (int)point);
        PVector pp = p1.copy().add(dir);
        ellipse(pp.x, pp.y, 20, 20);
      }
    }
  }

  // #endregion
}
