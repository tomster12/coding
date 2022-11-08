
// Globals
PWorld PWORLD;
float DT;

void setup() {
  size(800, 800);
  rectMode(CENTER);
  PWORLD = new PWorld();
  new Cloth(100, 100, 20, 20, 25);
}


void draw() {
  background(17, 15, 18);
  DT = 1.0 / frameRate;
  PWORLD.draw();
}


class Cloth {

  int rows, cols;
  PParticle[][] particles;
  ArrayList<PStick> sticks;


  Cloth(int px, int py, int rows, int cols, float scaling) {
    this.rows = rows;
    this.cols = cols;
    
    particles = new PParticle[cols][rows];    
    for (int x = 0; x < cols; x++) {
      for (int y = 0; y < rows; y++) {
        particles[x][y] = new PParticle(px+ x * scaling, py + y * scaling, 1);
      }
    }
    particles[0][0].pin();
    particles[cols - 1][0].pin();

    sticks = new ArrayList<PStick>();
    for (int x = 0; x < cols; x++) {
      for (int y = 0; y < rows; y++) {
        if (x < cols - 1) sticks.add(new PStick(particles[x][y], particles[x + 1][y], scaling));
        if (y < rows - 1) sticks.add(new PStick(particles[x][y], particles[x][y + 1], scaling));
      }
    }
  }
}


class PWorld {

  ArrayList<PParticle> particles;
  ArrayList<PStick> sticks;


  PWorld() {
    particles = new ArrayList<PParticle>();
    sticks = new ArrayList<PStick>();
  }
  
  void addParticle(PParticle p) { particles.add(p); }
  void addSpring(PStick s) { sticks.add(s); }


  void draw() {
    update();
    show();
  }

  void update() {
    float GRAVITY_ACC = 30;
    float DRAG = 0.005;
    float INTERACT_DIST = 50;
    float INTERACT_FORCE = 200;
    float NOISE_X_POS_MULT = 0.01;
    float NOISE_Y_POS_MULT = 0.01;
    float NOISE_X_TIME_MULT = 0.01;
    float NOISE_Y_TIME_MULT = 0.01;
    float WIND_FORCE = 0;

    // Calculate mouseForce
    float mouseForceX = (mouseX - pmouseX) * INTERACT_FORCE;
    float mouseForceY = (mouseY - pmouseY) * INTERACT_FORCE;
    
    // Update all particles
    for (PParticle p : particles) {

      // Lock in place
      if (p.isPinned) {
        p.posX = p.pinX;
        p.posY = p.pinY;
      }

      // Add gravity
      float accX = 0;
      float accY = 0;
      accY += GRAVITY_ACC;

      // Add wind force
      float r = noise(
        p.posX * NOISE_X_POS_MULT + frameCount * NOISE_X_TIME_MULT,
        p.posY * NOISE_Y_POS_MULT + frameCount * NOISE_Y_TIME_MULT
      );
      float windForceX = cos(r * 2 * PI) * WIND_FORCE;
      float windForceY = sin(r * 2 * PI) * WIND_FORCE;
      accX += windForceX / p.mass;
      accY += windForceY / p.mass;

      // Add mouse force
      float mouseDiffX = mouseX - p.posX;
      float mouseDiffY = mouseY - p.posY;
      float mouseDist = sqrt(mouseDiffX * mouseDiffX + mouseDiffY * mouseDiffY);
      if (mouseDist < INTERACT_DIST) {
        accX += (mouseForceX / p.mass) * (1 - mouseDist / INTERACT_DIST);
        accY += (mouseForceY / p.mass) * (1 - mouseDist / INTERACT_DIST);
      }

      // Verlet integration
      float prevX = p.posX;
      float prevY = p.posY;
      p.posX = p.posX + (p.posX - p.prevX) * (1.0 - DRAG) + accX * (1.0 - DRAG) * DT * DT;
      p.posY = p.posY + (p.posY - p.prevY) * (1.0 - DRAG) + accY * (1.0 - DRAG) * DT * DT;
      p.prevX = prevX;
      p.prevY = prevY;
    }

    for (PStick s : sticks) {
      float diffX = s.b.posX - s.a.posX;
      float diffY = s.b.posY - s.a.posY;
      float dst = sqrt(diffX * diffX + diffY * diffY);
      float diffFactor = (s.length - dst) / dst * 0.5;
      s.a.posX -= diffX * diffFactor;
      s.a.posY -= diffY * diffFactor;
      s.b.posX += diffX * diffFactor;
      s.b.posY += diffY * diffFactor;
    }
  }

  void show() {
    for (PParticle p : particles) p.show();
    for (PStick s : sticks) s.show();
  }
}

class PParticle {

  float posX, posY, prevX, prevY, pinX, pinY;
  float mass;
  boolean isPinned;


  PParticle(float posX, float posY, float mass) {
    this.posX = posX;
    this.posY = posY;
    this.prevX = posX;
    this.prevY = posY;
    this.mass = mass;
    PWORLD.addParticle(this);
  }


  void show() {
    fill(255);
    noStroke();
    ellipse(posX, posY, 5, 5);
  }


  void pin() { isPinned = true; pinX = posX; pinY = posY; }
  void unpin() { isPinned = false; }
}

class PStick {

  PParticle a, b;
  float length;


  PStick(PParticle a, PParticle b, float length) {
    this.a = a;
    this.b = b;
    this.length = length;
    PWORLD.addSpring(this);
  }


  void show() {
    stroke(255);
    line(a.posX, a.posY, b.posX, b.posY);
  }
}
