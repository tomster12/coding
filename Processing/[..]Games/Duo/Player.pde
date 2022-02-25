

class Player {
  // #region - Setup

  InputManager im;
  float walkSpeed;
  float runSpeed;
  float rollSpeed;

  PVector pos;
  PVector vel;
  boolean alive;
  float size;
  float health;
  color[] healthColors;

  PVector rollDir;
  float[] rollInfo;
  float shootCharge;
  boolean shielded;
  float shieldSize;
  float shieldCharge;


  Player(PVector pos_) {
    im = new InputManager(this);
    walkSpeed = 5;
    runSpeed = 8;
    rollSpeed = 13;

    pos = pos_;
    vel = new PVector(0.01, 0);
    alive = true;
    size = 20;
    health = 100;
    healthColors = new color[] {color(239, 57, 57), color(79, 247, 124)};

    rollDir = new PVector(0, 0);
    rollInfo = new float[] {0, 0, 0};
    shootCharge = 0;
    shielded = false;
    shieldSize = 20;
  }

  // #endregion


  // #region - Update Functions

  void update() {
    if (alive) {
      updateMovement();
      updateAttack();
    }
    show();
  }


  void show() {
    stroke(getHealthColor());
    ellipse(pos.x, pos.y, size, size);

    stroke(117, 193, 217, 255*shieldCharge);
    ellipse(pos.x, pos.y, (size+shieldSize)*shieldCharge, (size+shieldSize)*shieldCharge);

    if (alive) {
      stroke(100);
      PVector dir = getLookPos();
      float s = getShootSize();
      ellipse(pos.x + dir.x, pos.y + dir.y, s, s);
    }
    stroke(255);
  }

  //#endregion


  // #region - Movement

  void updateMovement() {
    if (rollInfo[1] == 0) rollInfo[0] = 0; // Roll changes
    if (rollInfo[1] > 0) rollInfo[1]--;
    if (rollInfo[2] > 0) rollInfo[2]--;

    if (im.getMoving() && rollInfo[0] == 0) {
      PVector dir = im.getMovementDir(); // Accelerate in moving direction
      dir.mult(0.6);
      vel.add(dir);

      float sl = walkSpeed; // Apply speed limit
      if (im.getKey(16)) sl = runSpeed;
      float mg = vel.mag();
      mg = mg>sl?sl:mg;
      vel.setMag(mg);

    } else if (rollInfo[0] == 0) { // Slow down when not moving
      vel.setMag(vel.mag() * 0.85);
    }
    pos.add(vel);

    if (rollInfo[0] == 1) { // Roll particles
      if (frameCount % 3 == 0) {
        makeParticles(2, pos, vel.copy().mult(-0.01), new float[] {-1, 1}, 5, color(255));
      }
    }

    if (pos.x > width) pos.x = 0;
    if (pos.x < 0) pos.x = width;
    if (pos.y > height) pos.y = 0;
    if (pos.y < 0) pos.y = height;
  }


  void roll() {
    if (rollInfo[0] == 0 && rollInfo[2] == 0) { // If cooldown and not rollings
      vel.normalize().mult(rollSpeed);
      rollInfo[0] = 1;
      rollInfo[1] = 15;
      rollInfo[2] = 60;

      explode(300, 5);
    }
  }

  // #endregion


  // #region - Attack

  void updateAttack() {
    if (im.getKey(68)) {
      if (shootCharge < 1) {
        shootCharge += 1.0/60.0;
      } else if (shieldCharge < 1) {
        shieldCharge += 1/60.0;
        if (shieldCharge >= 1) {
          sounds[4].play();
          addText(soundNames[4] + (int)pos.x + ":" + (int)pos.y);
        }
      }
    } else {
      shootCharge = 0;
    }
  }


  void shoot() {
    if (shieldCharge < 1) {
      shieldCharge = 0;
    }
    PVector lp = getLookPos();
    PVector pPos = pos.copy().add(lp);
    PVector pDir = lp.normalize();
    float pSize = getShootSize();
    float pVel = 3 + vel.mag() + map(pSize, pSizeRange[0], pSizeRange[1], 3, 0);
    Projectile p = new Projectile(pPos, pDir, pVel, pSize);
    projectiles.add(p);
    sounds[0].play();
    addText(soundNames[0] + (int)pos.x + ":" + (int)pos.y);
  }


  void damage(float val) {
    if (shieldCharge >= 1) {
      shieldCharge = 0;
      explode(150, 10);
      shootCharge = 0;
    } else {
      health -= val;
      if (health <= 0) {
        alive = false;
        health = 0;
        for (int i = enemies.size()-1; i >= 0; i--) enemies.get(i).destroy(1);
      }
      float amount = random(3, 6);
      makeParticles(amount, pos, vel, new float[] {-2, 2}, 0.2 * val / amount, healthColors[0]);
      sounds[6].play();
      addText(soundNames[6] + (int)pos.x + ":" + (int)pos.y);
    }
  }


  void explode(float d, float m) {
    for (int i = enemies.size()-1; i >= 0; i--) {
      PVector ep = enemies.get(i).pos.copy();
      PVector dir = ep.sub(pos);
      if (dir.mag() < d) {
        dir.normalize().mult(m);
        enemies.get(i).vel.add(dir);
        enemies.get(i).damage(m);
      }
    }
    sounds[2].play();
    addText(soundNames[2] + (int)pos.x + ":" + (int)pos.y);
  }

  // #endregion


  // #region - Other

  float getShootSize() {
    return map(shootCharge*shootCharge, 0, 1, pSizeRange[0], pSizeRange[1]);
  }


  PVector getLookPos() {
    return vel.copy().normalize().mult(10);
  }


  void addHealth(float val) {
    float amount = random(2, 4);
    makeParticles(amount, pos, vel, new float[] {-1, 1}, 4, getHealthColor());
    health += val;
  }


  color getHealthColor() {
    return lerpColor(healthColors[0], healthColors[1], health/100);
  }

  // #endregion
}
