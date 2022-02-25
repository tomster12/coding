class Projectile {
  // #region - Setup

  PVector pos;
  PVector dir;
  float speed;
  float size;


  Projectile(PVector pos_, PVector dir_, float speed_, float size_) {
    pos = pos_;
    dir = dir_;
    speed = speed_;
    size = size_;
  }

  // #endregion


  // #region - Main Functions

  void update() {
    movement();
    show();
  }


  void movement() {
    pos.add(dir.copy().mult(speed));
    if (pos.x + size/2 < 0 || pos.x - size/2 > width
    || pos.y +size/2 < 0 || pos.y - size/2 > height) {
      destroy();
    }
  }


  void show() {
    stroke(100);
    ellipse(pos.x, pos.y, size, size);
    stroke(255);
  }

  // #endregion


  // #region - Other

  float getDamage() {
    return 2 * size;
  }


  void destroy() {
    projectiles.remove(this);
  }

  // #endregion
}
