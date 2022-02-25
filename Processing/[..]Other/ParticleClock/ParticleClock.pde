
// #region - Setup

// Declare constant variables
final PVector spareCenter = new PVector(400, 550);
final float spareRadius = 120;
final int initSpare = 120;

final PVector charStart = new PVector(80, 120);
final float charSize = 640 / 8.0;
final int numChars = 8;

final int[] pSizeRange = { 12, 20 };
final int[] pColRange = { 100, 180 };
final float pMouseInteractRange = 150;
final float pMouseInteractStrength = 25;
final float pMousePressedMult = 20;
final float pAccMult = 0.01;
final float pFrcMult = 0.85;

// Declare variables
ArrayList<ArrayList<Particle>> charParticles;
ArrayList<Particle> spareParticles;


void setup() {
  // Main setup
  size(800, 800);
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  charParticles = new ArrayList<ArrayList<Particle>>();
  spareParticles = new ArrayList<Particle>();

  // Populate particles
  for (int i = 0; i < numChars; i++) charParticles.add(new ArrayList<Particle>());
  for (int i = 0; i < initSpare; i++) spareParticles.add(new Particle(spareCenter));
}

// #endregion


// #region - Main

void draw() {
  background(33, 33, 33);

  // Draw call
  drawNums();
  drawSpareParticles();
}


void drawNums() {
  // Setup chars array
  int[] chars = new int[] {
    hour() / 10, hour() % 10, 10,
    minute() / 10, minute() % 10, 10,
    second() / 10, second() % 10
  };

  // For each char to draw
  for (int i = 0; i < chars.length; i++) {
    int[][] charArray = charArrays[chars[i]];
    int index = -1;

    // For each position
    for (int y = 0; y < charArray.length; y++) {
      for (int x = 0; x < charArray[y].length; x++) {
        if (charArray[y][x] == 1) {
          index++;

          // Borrow spare if needed
          if (charParticles.get(i).size() < (index + 1)) charParticles.get(i).add(borrowSpare());
          Particle p = charParticles.get(i).get(index);

          // Position particle
          p.gotoPos.x = charStart.x + charSize * (i + (float)x / charArray[y].length);
          p.gotoPos.y = charStart.y + charSize * ((float)y / charArray[y].length);

          // Draw particle
          charParticles.get(i).get(index).draw();
        }
      }
    }

    // Add all extra back to spare
    while (charParticles.get(i).size() > (index + 1))
      setSpare(i, charParticles.get(i).size() - 1);
  }
}


void drawSpareParticles() {
  // Position spare particles
  for (int i = 0; i < spareParticles.size(); i++) {
    Particle p = spareParticles.get(i);
    float pct = ((float)i / spareParticles.size() + frameCount * 0.001) % 1;
    p.gotoPos.x = spareCenter.x + cos(pct * TWO_PI) * (spareRadius * (0.95 + 0.1 * sin(frameCount * 0.04)));
    p.gotoPos.y = spareCenter.y + sin(pct * TWO_PI) * (spareRadius * (0.95 + 0.1 * sin(frameCount * 0.04)));

    // Draw spare particle
    p.draw();
  }
}


void setSpare(int i, int o) {
  // Add a particle to the spare array
  Particle p = charParticles.get(i).get(o);
  int randInt = floor(random(spareParticles.size()));
  charParticles.get(i).remove(p);
  spareParticles.add(randInt, p);
}


Particle borrowSpare() {
  // Returns a particle from the spare array
  int randInt = floor(random(spareParticles.size()));
  Particle p = spareParticles.get(randInt);
  spareParticles.remove(p);
  return p;
}

// #endregion


class Particle {

  // #region - Main

  // Declare variables
  PVector gotoPos;
  PVector pos;
  PVector vel;
  float size;
  color col;


  Particle(PVector pos_) {
    // Initialize variables
    gotoPos = pos_.copy();
    pos = pos_.copy();
    vel = new PVector(0, 0);
    size = pSizeRange[0] + random(pSizeRange[1] - pSizeRange[0]);
    col = color(
      pColRange[0] + random(pColRange[1] - pColRange[0]),
      pColRange[0] + random(pColRange[1] - pColRange[0]),
      pColRange[0] + random(pColRange[1] - pColRange[0]));
  }

  // #endregion


  // #region - Main

  void draw() {
    // Draw call
    update();
    show();
  }


  void update() {
    // Handle mouse input
    if (dist(mouseX, mouseY, pos.x, pos.y) < pMouseInteractRange || mousePressed) {
      PVector dir = pos.copy().sub(new PVector(mouseX, mouseY));
      float strength = pMouseInteractStrength / dir.mag();
      if (mousePressed) strength *= pMousePressedMult;
      dir.normalize().mult(strength);
      vel.add(dir);
    }

    // Update vectors
    vel.add(gotoPos.copy().sub(pos).mult(pAccMult));
    pos.add(vel);
    vel.mult(pFrcMult);
  }


  void show() {
    // Draw as ellipse
    noFill();
    stroke(col);
    if (spareParticles.contains(this))
      strokeWeight(1);
    else strokeWeight(2);
    ellipse(pos.x, pos.y, size, size);
  }

  // #endregion
}
