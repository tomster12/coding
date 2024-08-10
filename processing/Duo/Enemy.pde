

class Enemy {
  // #region - Setup

  PVector pos;
  PVector vel;
  float size;


  Enemy(PVector pos_, PVector vel_, float size_) {
    pos = pos_;
    vel = vel_;
    size = size_;
  }

  // #endregion


  // #region - Main Functions

  void update() {
    movement();
    show();
    checkCollisions();
  }


  void movement() {
    PVector dir = getDirection();
    pos.add(dir);

    pos.add(vel);
    vel.mult(0.9);
  }


  void show() {
    ellipse(pos.x, pos.y, size, size);
  }


  void checkCollisions() {
    for (int i = 0; i < projectiles.size(); i++) {
      Projectile p = projectiles.get(i);
      if (dist(p.pos.x, p.pos.y, pos.x, pos.y) < size / 2 + p.size / 2) {
        damage(p.getDamage());
        p.destroy();
      }
    }
    if (dist(pos.x, pos.y, player.pos.x, player.pos.y) < size/2 + player.size/2 + (player.shieldCharge>=1?player.shieldSize:0)) {
      if (player.alive && player.rollInfo[0] == 0) {
        player.damage(size);
        destroy(1);
      }
    }
  }

  // #endregion


  // #region - Damage

  void damage(float val) {
    if (val > size * 2/3) {
      if (size > 20) {
        split();
      } else {
        destroy(0);
      }

    } else {
      score += val/4.0;
      size -= val;
      float amount = floor(random(1, 4));
      makeParticles(amount, pos, vel, new float[] {-1, 1}, val / amount, color(255));
      if (size < 10) destroy(0);
      sounds[5].play();
      addText(soundNames[5] + (int)pos.x + ":" + (int)pos.y);
    }
  }


  void split() {
    if (player.alive) {
      player.addHealth(size/10.0);
      float amount = random(1, 3);
      PVector pDir = player.pos.copy().sub(pos).mult(0.05);
      makeParticles(amount, pos, vel.copy().add(pDir), new float[] {-2, 2}, 4, player.getHealthColor());
      sounds[3].play();
      addText(soundNames[3] + (int)pos.x + ":" + (int)pos.y);
    }

    score += 20;
    float s = size / 2.0;
    float mg = size / 2.0;

    PVector dir = getDirection();
    dir = new PVector(-dir.y, dir.x);
    PVector d1 = dir.copy().mult(mg);
    PVector d2 = dir.copy().mult(-mg);

    Enemy e1 = new Enemy(
      pos.copy(),
      d1,
      size / 2
    );
    Enemy e2 = new Enemy(
      pos.copy(),
      d2,
      size / 2
    );

    enemies.add(e1);
    enemies.add(e2);
    destroy(0);
  }

  // #endregion


  // #region - Other

  PVector getDirection() {
    float speed = map(size, 10, 50, 1, 0);
    speed = 0.5 + (float)Math.pow(speed, 2) * 2;
    PVector dir = player.pos.copy().sub(pos);
    dir.normalize().mult(speed);
    return dir;
  }


  void destroy(int type) {
    int amount = floor(random(3, 6));
    float each = size / amount;
    makeParticles(amount, pos, vel, new float[] {-2, 2}, each, color(255));
    enemies.remove(this);
    sounds[1].play();
    addText(soundNames[1] + (int)pos.x + ":" + (int)pos.y);
  }

  // #endregion
}
