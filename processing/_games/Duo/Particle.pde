

void makeParticles(float amount, PVector pos, PVector vel, float[] rVelRange, float size, color col) {
  for (int i = 0; i < amount; i++) {
    float a = random(TWO_PI);
    PVector dir = new PVector(cos(a), sin(a));
    dir.mult(random(rVelRange[0], rVelRange[1]));
    particles.add(new Particle(
      pos.copy(),
      vel.copy().add(dir),
      size,
      30 + random(90),
      col
    ));
  }
}


class Particle {
  // #region - Setup

  PVector pos;
  PVector vel;
  float size;
  float startTime;
  float time;
  color col;


  Particle(PVector pos_, PVector vel_, float size_, float time_, color col_) {
    pos = pos_;
    vel = vel_;
    size = size_;
    startTime = time_;
    time = time_;
    col = col_;
  }

  // #endregion


  // #region - Main Functions

  void update() {
    movement();
    show();
  }


  void movement() {
    pos.add(vel);
    time--;
    if (time < 0) {
      particles.remove(this);
    }
  }


  void show() {
    stroke(col, 255 * time/startTime);
    ellipse(pos.x, pos.y, size, size);
    stroke(255);
  }

  // #endregion
}
