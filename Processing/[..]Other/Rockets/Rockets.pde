
// #region - Setup

// Declare variables
final PVector gravity = new PVector(0, 0.05);
ArrayList<Rocket> rockets;
ArrayList<Particle> particles;

void setup() {
  // Initial setup
  fullScreen();
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  rockets = new ArrayList<Rocket>();
  particles = new ArrayList<Particle>();

  // Populate rockets
  for (int i = 0; i < 20; i++) addRandomRocket();
}

// #endregion


// #region - Main

void draw() {
  background(0);

  // Call draw for rockets and particles
  for (int i = 0; i < rockets.size(); i++) rockets.get(i).draw();
  for (int i = particles.size() - 1; i >= 0; i--) particles.get(i).draw();
}


PVector angleVec(float angle) {
  // Returns angled vector
  return new PVector(cos(angle), sin(angle));
}


void mouseWheel(MouseEvent event) {
  // Add / remove rockets
  float e = event.getCount();
  if (e > 0) addRandomRocket();
  else if (rockets.size() > 0) rockets.remove(0);
}


void addRandomRocket() {
  // Returns a random rocket
  rockets.add(new Rocket(new PVector(random(width), height * (0.5 + random(0.5))), random(0.08, 0.2)));
}

// #endregion


class Rocket {

  // #region - Main

  // Declare variables
  PVector pos;
  PVector vel;
  PVector acc;

  PVector size;
  float dir;
  float thrustStrength;


  Rocket(PVector pos_, float thrustStrength_) {
    // Initialize variables
    pos = pos_;
    vel = new PVector(0, 0);
    acc = new PVector(0, 0);

    size = new PVector(20, 5);
    dir = 0;
    thrustStrength = thrustStrength_;
  }


  void draw() {
    // Draw call
    update();
    show();
  }


  void update() {
    // Handle user input
    dir = atan2(mouseY - pos.y, mouseX - pos.x);

    // Apply forces
    if (mousePressed) acc.add(angleVec(dir).mult(thrustStrength));
    acc.add(gravity);
    vel.add(acc);
    pos.add(vel);
    acc.mult(0);

    // Create particles
    if (mousePressed && frameCount % 2 == 0) {
      float a = dir + PI + random(-0.1, 0.1);
      color c = color(208, random(90, 160), 52);
      particles.add(new Particle(
        pos.copy().add(angleVec(dir).mult(size.x * -1.0)),
        new PVector(cos(a), sin(a)).mult(random(2, 5)),
        random(1, 4),
        random(60, 120),
        c
      ));
    }
  }


  void show() {
    // Show rocket
    pushMatrix();
    translate(pos.x, pos.y);
    rotate(dir);
    noFill();
    stroke(255);
    rect(size.x * -0.8, size.y * -0.5, size.x * 0.8, size.y * 1.0);
    rect(size.x * -1.0, size.y * -0.6, size.x * 0.2, size.y * 1.2);
    popMatrix();
  }

  // #endregion
}


class Particle {

  // #region - Main

  // Declare variables
  PVector pos;
  PVector vel;
  PVector acc;

  float size;
  float sLife;
  float life;
  color col;


  Particle(PVector pos_, PVector vel_, float size_, float life_, color col_) {
    // Initialize variables
    pos = pos_;
    vel = vel_;
    acc = new PVector(0, 0);

    size = size_;
    sLife = life_;
    life = life_;
    col = col_;
  }


  void draw() {
    // Draw call
    update();
    show();
  }


  void update() {
    // Apply forces
    acc.add(gravity);
    vel.add(acc);
    pos.add(vel);
    acc.mult(0);

    // Update life
    life--;
    if (life < 0) particles.remove(this);
  }


  void show() {
    // Show based on life
    noFill();
    stroke(col, 255 * life / sLife);
    ellipse(pos.x, pos.y, size, size);
  }

  // #endregion
}
