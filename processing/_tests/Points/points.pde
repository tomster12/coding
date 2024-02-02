

ArrayList<connection> connections = new ArrayList<connection>();
ArrayList<point> points = new ArrayList<point>();
point selected;


//-------------------------------------------------------------------


void setup() {
  size(600, 600);

  for (int i = 0; i < 30; i++) {
    points.add(new point(new PVector(random(100, 500), random(100, 500)), random(15, 60)));
  }
}


//-------------------------------------------------------------------


void draw() {
  background(0);


  for (int i = 0; i < connections.size(); i++) {
    connections.get(i).update();
  }
    for (int i = 0; i < points.size(); i++) {
    points.get(i).update();
  }


  for (int i = 0; i < connections.size(); i++) {
    connections.get(i).show();
  }
  for (int i = 0; i < points.size(); i++) {
    points.get(i).show();
  }


  if (selected != null) {
    selected.pos = new PVector(mouseX, mouseY);
  }


  if (mousePressed) {
    for (int i = 0; i < points.size(); i++) {
      PVector dir = new PVector(mouseX, mouseY);
      dir.sub(points.get(i).pos);
      dir.mult(0.05);
      points.get(i).pos.add(dir);
    }
  }
}


//-------------------------------------------------------------------


float getConnectDistance(float s1, float s2) {
  float d = 3 * (s1+s2)/2;
  return d;
}


float getConnectionDistance(float s1, float s2) {
  float d = 2 * (s1+s2)/2;
  return d;
}


void mousePressed() {
  for (int i = 0; i < points.size(); i++) {
    point p = points.get(i);
    if (dist(mouseX, mouseY, p.pos.x, p.pos.y) < p.size / 2) {
      selected = p;
    }
  }
}


void mouseReleased() {
    if (selected != null) {
    selected = null;
  }
}
