
// #region - Setup

Player player;
PVector tempLightDir;
// ArrayList<Light> lights;
ArrayList<Sphere> spheres;


void setup() {
  size(800, 800); // Main setup
  noStroke();
  noSmooth();
  textSize(25);

  player = new Player(new PVector(-50, 20));
  tempLightDir = new PVector(0, 1, 0.2).normalize();
  // lights = new ArrayList<Light>(); // Setup lights
  // lights.add(new Light(new PVector(0, 100, 100), color(255, 150, 150)));
  // lights.add(new Light(new PVector(0, -100, 100), color(150, 255, 150)));
  spheres = new ArrayList<Sphere>(); // Setup spheres
  spheres.add(new Sphere(new PVector(100, 100, -50), 50));
  spheres.add(new Sphere(new PVector(120, 0, 0), 35));
  spheres.add(new Sphere(new PVector(80, -130, 0), 50));
}

// #endregion


// #region - Main

void draw() {
  background(0); // Main updates
  player.update();
}


float distanceToScene(PVector p) { // Get shortest distance to a scene object
  float distToSphere = 0;
  for (int i = 0; i < spheres.size(); i++) {
    float d = spheres.get(i).signedDistance(p);
    if (d < distToSphere || i==0) {
      distToSphere = d;
    }
  }
  return distToSphere;
}


PVector estimateNormal(PVector p) { // Get an estimated normal value
  float normalEpsilon = 0.1;
  return new PVector(
    distanceToScene(new PVector(p.x+normalEpsilon, p.y, p.z))-distanceToScene(new PVector(p.x-normalEpsilon, p.y, p.z)),
    distanceToScene(new PVector(p.x, p.y+normalEpsilon, p.z))-distanceToScene(new PVector(p.x, p.y-normalEpsilon, p.z)),
    distanceToScene(new PVector(p.x, p.y, p.z+normalEpsilon))-distanceToScene(new PVector(p.x, p.y, p.z-normalEpsilon))
  ).normalize();
}


color colTrace(PVector point, PVector direction, int reflectCount) { // Ray trace and find color
  int count = 0;
  PVector p = point.copy();
  PVector dir = direction.copy();
  float d = distanceToScene(p);
  while (true) {

    if (count > 50) return color(40);

    if (d < 2) {
      PVector norm = estimateNormal(p);
      float mult = vDot(norm.copy().mult(-1), tempLightDir); // Color of object
      color current = color(200*mult, 100*mult, 100*mult);
      if (reflectCount == 0) return current;

      color reflect = colTrace(p.add(norm.copy().mult(3)), norm, reflectCount-1);
      float r = red(current) + 0.8*red(reflect);
      float g = green(current) + 0.8*green(reflect);
      float b = blue(current) + 0.8*blue(reflect);
      return color(r, g, b);
    }

    p.add(dir.copy().mult(d));
    d = distanceToScene(p);
    count++;
  }
}

// #endregion


// #region - Input

void keyPressed() {
  player.keysPressed[keyCode] = true;
}


void keyReleased() {
  player.keysPressed[keyCode] = false;
}


PVector vectorFromAngles(float a1, float a2) {
  return new PVector(
    cos(a1)*cos(a2),
    sin(a1)*cos(a2),
    sin(a2)
  );
}


float vDot(PVector v1, PVector v2) {
  return v1.x*v2.x + v1.y*v2.y + v1.z+v2.z;
}

// #endregion


class Player {
  // #region - Main

  PVector viewScale;
  float horzFov;
  float vertFov;

  PVector pos;
  float horzAngle;
  float vertAngle;
  PGraphics view;
  boolean[] keysPressed;


  Player(PVector pos_) {
    viewScale = new PVector(250, 250); // Setup constants
    horzFov = TWO_PI * 45/360;
    vertFov = TWO_PI * 45/360;

    pos = pos_; // Setup variables
    view = createGraphics((int)viewScale.x, (int)viewScale.y);
    horzAngle = 0;
    vertAngle = 0;
    keysPressed = new boolean[400];
  }


  void update() {
    updateInput();
    updateView();
  }


  void updateInput() {
    if (mousePressed) {
      horzAngle += (mouseX - pmouseX) * 0.01; // Move camera
      vertAngle += (mouseY - pmouseY) * 0.01;
    }

    float speed = keysPressed[16]?0.2:1; // Get direction vectors and speed
    PVector moveForward = vectorFromAngles(horzAngle, vertAngle).mult(speed);
    PVector moveSideward = vectorFromAngles(horzAngle+PI/2, vertAngle).mult(speed);
    PVector moveUpward = new PVector(0, 0, 1).mult(speed);

    if (keysPressed[65]) pos.sub(moveSideward); // Move position
    if (keysPressed[87]) pos.add(moveForward);
    if (keysPressed[68]) pos.add(moveSideward);
    if (keysPressed[83]) pos.sub(moveForward);
    if (keysPressed[69]) pos.add(moveUpward);
    if (keysPressed[81]) pos.sub(moveUpward);
  }


  void updateView() {
    view.beginDraw(); // Update view
    view.loadPixels();

    for (int i = 0; i < viewScale.x*viewScale.y; i++) { // Get forward vector for each direction
      float horzProg = map((i%viewScale.x), 0, viewScale.x, -0.5, 0.5);
      float vertProg = map(floor(i/viewScale.x), 0, viewScale.y, -0.5, 0.5);
      float horz = horzAngle + horzProg*horzFov;
      float vert = vertAngle + vertProg*vertFov;
      PVector dir = vectorFromAngles(horz, vert);

      // Ray trace it forward to get color
      view.pixels[i] = colTrace(pos, dir, 1);
    }

    view.updatePixels();
    view.endDraw();
    image(view, 0, 0, width, height); // Show view

    noStroke(); // Debug
    fill(255);
    text(horzAngle, 50, 50);
    text(vertAngle, 50, 80);
    text(nf(pos.x,3,2)+", "+nf(pos.y,3,2)+", "+nf(pos.z,3,2), 50, 110);
  }

  // #endregion
}


class Sphere {
  // #region - Main

  PVector pos;
  float size;


  Sphere(PVector pos_, float size_) {
    pos = pos_;
    size = size_;
  }


  float signedDistance(PVector point) {
    float dx = pos.x-point.x;
    float dy = pos.y-point.y;
    float dz = pos.z-point.z;
    return sqrt(dx*dx + dy*dy + dz*dz) - size;
  }

  // #endregion
}


class Light {
  // #region - Main

  PVector pos;
  color col;


  Light(PVector pos_, color col_) {
    pos = pos_;
    col = col_;
  }

  // #endregion
}
