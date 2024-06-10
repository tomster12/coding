
// #region - Setup

ArrayList<Boid> boids;
float viewAngle;
float movementSpeed;
float seperationRangeSq;
float seperationCoefficent;
float alignRangeSq;
float alignCoefficent;
float cohesionRangeSq;
float cohesionCoefficent;
float drawSize;


void setup() {
  size(800, 800);
  setupVariables();
}


void setupVariables() {
  boids = new ArrayList<Boid>();
  viewAngle = TWO_PI * 0.8;
  movementSpeed = 0.8;
  seperationRangeSq = 18 * 18;
  seperationCoefficent = 2;
  alignRangeSq = 25 * 25;
  alignCoefficent = 0.04;
  cohesionRangeSq = 40 * 40;
  cohesionCoefficent = 0.002;
  drawSize = 5;

  for (int i = 0; i < 150; i++) {
    boids.add(new Boid(
      new PVector(random(width), random(height)),
      random(TWO_PI)
    ));
  }
  boids.get(0).selected = true;
}

// #endregion


// #region - Main

void draw() {
  background(20);

  noFill();
  stroke(100, 200, 100);
  strokeWeight(1);
  for (Boid boid : boids)
    boid.update0();

  noFill();
  stroke(255);
  strokeWeight(drawSize);
  for (Boid boid : boids)
    boid.update1();
}


float moduloDistance(float val0, float val1, float modulo) {
    float dist0 = val1 - val0;
    float dist1 = val1 - (val0 + modulo);
    if (abs(dist0) < abs(dist1))
      return dist0;
    else return dist1;
}

// #endregion


class Boid {

  // #region - Main

  boolean selected;
  PVector pos;
  float dir;
  float dirAcc;


  Boid(PVector pos_, float dir_) {
    selected = false;
    pos = pos_;
    dir = dir_;
    dirAcc = 0;
  }


  void update0() {
    // Seperate from nearby
    for (Boid oBoid : boids) {
      if (oBoid != this) {
        PVector oBoidDir = oBoid.pos.copy().sub(pos);
        if (oBoidDir.magSq() < seperationRangeSq) {
          steerTowards(atan2(-oBoidDir.y, -oBoidDir.x),
          seperationCoefficent / oBoidDir.magSq());
          if (selected) {
            stroke(200, 100, 100);
            strokeWeight(2);
            line(
              pos.x, pos.y,
              pos.x + oBoidDir.x,
              pos.y + oBoidDir.y
            );
            stroke(255);
            strokeWeight(drawSize);
          }
        }
      }
    }

    // Steer in line with nearby
    float totDir = 0;
    int dirCount = 0;
    for (Boid oBoid : boids) {
      PVector oBoidDir = oBoid.pos.copy().sub(pos);
      if (oBoidDir.magSq() < alignRangeSq) {
        totDir += oBoid.dir;
        dirCount++;
        if (selected) {
          stroke(100, 200, 100);
          strokeWeight(1);
          PVector heading = oBoid.getHeading();
          line(
            oBoid.pos.x, oBoid.pos.y,
            oBoid.pos.x + heading.x * 25,
            oBoid.pos.y + heading.y * 25
          );
          stroke(255);
          strokeWeight(drawSize);
        }
      }
    }
    if (dirCount > 0) {
      steerTowards(totDir / dirCount, alignCoefficent);
    }

    // Steer towards the centre of bearby
    PVector totPos = new PVector(0, 0);
    int posCount = 0;
    for (Boid oBoid : boids) {
      PVector oBoidDir = oBoid.pos.copy().sub(pos);
      if (oBoidDir.magSq() < cohesionRangeSq) {
        totPos.add(oBoid.pos);
        posCount++;
      }
    }
    if (posCount > 0) {
      PVector gotoPos = new PVector(
        totPos.x / posCount,
        totPos.y / posCount
      );
      PVector gotoDir = gotoPos.sub(pos);
      steerTowards(atan2(gotoDir.y, gotoDir.x), cohesionCoefficent);
      if (selected) {
        stroke(180, 180, 250);
        strokeWeight(1);
        line(
          pos.x, pos.y,
          pos.x + gotoDir.x,
          pos.y + gotoDir.y
        );
        stroke(255);
        strokeWeight(drawSize);
      }
    }
  }


  void update1() {
    // Update variables
    dir += dirAcc;
    dirAcc = 0;
    dir = (dir + TWO_PI) % TWO_PI;
    pos.add(getHeading().mult(movementSpeed));
    pos.x = (pos.x + width) % width;
    pos.y = (pos.y + height) % height;

    // Show
    stroke(100, 100, 200);
    strokeWeight(drawSize / 2);
    PVector heading = getHeading();
    PVector headingNorm = heading.copy().rotate(PI / 2.0);
    line(
      pos.x + headingNorm.x * drawSize * 0.8,
      pos.y + headingNorm.y * drawSize * 0.8,
      pos.x + heading.x * drawSize * 1.6,
      pos.y + heading.y * drawSize * 1.6
    );
    line(
      pos.x - headingNorm.x * drawSize * 0.8,
      pos.y - headingNorm.y * drawSize * 0.8,
      pos.x + heading.x * drawSize * 1.6,
      pos.y + heading.y * drawSize * 1.6
    );
    if (selected) {
      line(
        pos.x + heading.x * drawSize * 1.6,
        pos.y + heading.y * drawSize * 1.6,
        pos.x + heading.x * drawSize * 6.6,
        pos.y + heading.y * drawSize * 6.6
      );
    }
  }


  void steerTowards(float angle, float amount) {
    dirAcc += moduloDistance(dir, angle, TWO_PI) * amount;
  }


  PVector getHeading() {
    return new PVector(
      cos(dir),
      sin(dir)
    );
  }

  // #endregion
}
