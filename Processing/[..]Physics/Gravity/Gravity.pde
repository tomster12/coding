
// Need to use doubles for more accuracy
// PVectors dont support double
// Would need to cast to float when showing

// Mass     - Kg
// Radius   - M
// Force    - N


// #region - Setup

// Constant variables
final double g = 0.0000000000667;         // m^3 / kg / s^2
final float aluminiumDensKGpM3 = 2710;    // kg / m^3


// Declare variables
boolean[] inputs;
boolean toSimulate;
float timeMult;
float secondsPer60;
ArrayList<Object> objects;
Object selectedObject;
PVector camCentrePos;
PVector camGotoCentrePos;
float camScale;
float camGotoScale;


void setup() {
  // Main setup
  // fullScreen();
  size(800, 800);
  textSize(20);
  textAlign(CENTER);
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  inputs = new boolean[600];
  toSimulate = true;
  timeMult = 300;
  secondsPer60 = 1;
  objects = new ArrayList<Object>();
  selectedObject = null;
  camCentrePos = new PVector(0, 0);
  camGotoCentrePos = new PVector(0, 0);
  camScale = 0.0001;
  camGotoScale = 0.0001;

  // Create earth
  // Centre, 6371 km radius, 5.972*10^24 kg mass
  Object earth = new Object(
    new PVector(0, 0), 6371000, 5.972 * (float)Math.pow(10, 24));
  objects.add(earth);

  // Create satellite
  // 80km from earth, 50m radius, aluminium dens mass, 8100 m/s speed
  Object satellite0 = new Object(
    new PVector(6371000 + 80000, 0), 50, sphereVolume(50) * aluminiumDensKGpM3);
  satellite0.vel.y = 8100;
  objects.add(satellite0);

  // Create satellite
  // 100km from earth, 50m radius, aluminium dens mass, 8100 m/s speed
  Object satellite1 = new Object(
    new PVector(6371000 + 100000, 0), 50, sphereVolume(50) * aluminiumDensKGpM3);
  satellite1.vel.y = 8100;
  objects.add(satellite1);

  // Create satellite
  // 120km from earth, 50m radius, aluminium dens mass, 8100 m/s speed
  Object satellite2 = new Object(
    new PVector(6371000 + 120000, 0), 50, sphereVolume(50) * aluminiumDensKGpM3);
  satellite2.vel.y = 8100;
  objects.add(satellite2);

  // Create moon
  // Centre 384400km from earth, 1737.1 km radius, 7.3477*10^22 kg mass,
  Object moon = new Object(
    new PVector(6371000 + 384400000 + 1737100, 0), 1737100, 7.3477 * (float)Math.pow(10, 22));
  moon.vel.y = 1018.83;
  objects.add(moon);

  // Select satellite
  select(objects.get(1));
}

// #endregion


// #region - Main

void draw() {
  background(0);


  // Update objects
  if (toSimulate) {
    for (int i = 0; i < timeMult; i++) {
      for (Object object : objects)
        object.movement(secondsPer60 / frameRate);
    }
  }

  // Update camera
  if (selectedObject != null) {
    camGotoCentrePos = selectedObject.pos.copy();
    camCentrePos = camGotoCentrePos.copy();
  } else camCentrePos
    .add(camGotoCentrePos.copy()
    .sub(camCentrePos).mult(0.1));
  camScale += (camGotoScale - camScale) * 0.1;


  // Show information
  text(timeMult + "x time mult", width * 0.5, 25);
  text(secondsPer60 + "s per 60 frames", width * 0.5, 45);
  if (selectedObject != null) {
    text(selectedObject.mass + "kg", width * 0.5, 65);
    text(selectedObject.vel.mag() + "m/s", width * 0.5, 85);
    text(selectedObject.acc.mag() + "m/s^2", width * 0.5, 105);
  }

  // Camera transformations
  translate(width * 0.5, height * 0.5);
  scale(camScale);
  translate(-camCentrePos.x, -camCentrePos.y);

  // Show objects
  for (Object object : objects)
    object.show();
}


void select(Object object) {
  // Select an object
  selectedObject = object;
}


void focusSelectedObject() {
  // Set scale to selectedObjects size
  if (selectedObject != null) {
    camGotoScale = 0.5 * (min(width, height)) / (selectedObject.radius * 2);
    camScale = camGotoScale;
  }
}


PVector getMousePos() {
  // Returns a mouse pos on screen
  return new PVector(mouseX, mouseY);
}


PVector convertToWorld(PVector vec) {
  // Convert screen vector to world
  return new PVector(
    (vec.x - width * 0.5) / camScale + camCentrePos.x,
    (vec.y - height * 0.5) / camScale + camCentrePos.y
  );
}


float sphereVolume(float radius) {
  // Return the volume of a sphere with specific radius
  return (4 / 3 * PI * radius * radius * radius);
}

// #endregion


// #region - Input

void keyPressed() {
  inputs[keyCode] = true;

  // pause / start time
  if (keyCode == 32)
    toSimulate = !toSimulate;

  // Select a specific object
  else if (keyCode >= 49 && keyCode <= 57) {
    int num = keyCode - 49;
    if (selectedObject != null && num == objects.indexOf(selectedObject))
      focusSelectedObject();
    else if (objects.size() > num)
      select(objects.get(num));
  }

  // Change time mult
  if (inputs[16]) {
    if (keyCode == 37) secondsPer60 = max(secondsPer60  / 2, 1);
    else if (keyCode == 38) secondsPer60 = secondsPer60 + 1;
    else if (keyCode == 39) secondsPer60 = secondsPer60 * 2;
    else if (keyCode == 40) secondsPer60 = max(secondsPer60 - 1, 1);
  } else {
    if (keyCode == 37) timeMult = max(timeMult  / 2, 1);
    else if (keyCode == 38) timeMult = timeMult + 1;
    else if (keyCode == 39) timeMult = timeMult * 2;
    else if (keyCode == 40) timeMult = max(timeMult - 1, 1);
  }
}


void mouseClicked() {
  // Check if clicked on object
  if (mouseButton == LEFT) {
    PVector mousePos = convertToWorld(getMousePos());
    boolean found = false;
    for (Object object : objects) {
      if (dist(object.pos.x, object.pos.y, mousePos.x, mousePos.y) < object.radius) {
        found = true;
        select(object);
        break;
      }
    }
    if (!found) selectedObject = null;
  }
}


void keyReleased() {
  inputs[keyCode] = false;
}


void mouseDragged() {
  // Drag camera
  selectedObject = null;
  camGotoCentrePos.add(new PVector(
    (pmouseX - mouseX) / camGotoScale,
    (pmouseY - mouseY) / camGotoScale
  ));
}


void mouseWheel(MouseEvent e) {
  // Zoom based on mouse wheel
  camGotoScale *= 1 - e.getCount() * 0.1;
}

// #endregion


// #region - Class

class Object {

  // #region - Setup

  // Declare variables
  ArrayList<PVector> path;
  PVector pos;
  PVector vel;
  PVector acc;
  float radius;
  float mass;


  Object(PVector pos_, float radius_, float mass_) {
    // Initialize variables
    path = new ArrayList<PVector>();
    pos = pos_;
    vel = new PVector(0, 0);
    acc = new PVector(0, 0);
    radius = radius_;
    mass = mass_;
  }

  // #endregion


  // #region - Main

  void movement(float dt) {
    acc.mult(0);

    // Gravity
    for (Object object : objects) {
      if (object != this) {

        // Apply force
        float dst = dist(pos.x, pos.y, object.pos.x, object.pos.y);
        double forceMag = (g * mass * object.mass) / (dst * dst);
        PVector force = object.pos.copy() .sub(pos) .normalize() .mult((float)forceMag);
        applyForce(force);
      }
    }

    // Main kinematic movement
    vel.add(acc.copy().mult(dt));
    pos.add(vel.copy().mult(dt));
  }


  void show() {
    // Show the body as a circle with radius
    stroke(255);
    noFill();
    ellipse(pos.x, pos.y, radius * 2, radius * 2);

    // Update path
    if (frameCount % 10 == 0)
      path.add(pos.copy());
    if (path.size() > 50)
      path.remove(0);

    // Show path
    beginShape();
    for (PVector point : path)
      vertex(point.x, point.y);
    vertex(pos.x, pos.y);
    endShape();
  }


  void applyForce(PVector force) {
    // a = f / m, apply acceleration
    PVector accChange = force.div(mass);
    acc.add(accChange);
  }

  // #endregion
}

// #endregion
