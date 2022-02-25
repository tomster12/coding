

ArrayList<Orbiter> orbiters;
int pathLength;
PVector center;
Creation currentCreation;


void setup() {
  size(600, 600);
  orbiters = new ArrayList<Orbiter>();
  pathLength = 50;
  center = new PVector(width/2, height/2);
  
  orbiters.add(new Orbiter(0, PI*0.01, 100, 10));
  orbiters.add(new Orbiter(0, PI*0.005, 50, 10));
  orbiters.add(new Orbiter(0, PI*0.008, 150, 10));
}


void draw() {
  background(200);

  for (int i = 0; i < orbiters.size(); i++) {
    orbiters.get(i).update();
  }
  if (currentCreation != null) {
    currentCreation.update();
  }
}


void mousePressed() {
  currentCreation = new Creation(new PVector(mouseX, mouseY));
}


void mouseReleased() {
  if (currentCreation != null) {
     currentCreation.create();
  }
}



float tf(int x, int l) {
  float normX = map(x, 0, l, 0, 1);
  return normX * normX;
}


PVector getNorm(PVector p1, PVector p2) {
  PVector tan = p2.copy().sub(p1);
  PVector norm = new PVector(tan.y, -tan.x).normalize();
  return norm;
}
