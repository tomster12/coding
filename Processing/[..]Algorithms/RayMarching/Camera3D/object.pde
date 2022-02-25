class object {


  PVector pos;
  PVector size;
  color col;

  object(PVector pos_, PVector size_) {
    pos = pos_;
    size = size_;
    col = color(random(255), random(255), random(255));
  }


  void show() {
    noStroke();
    fill(255);
    rect(pos.x, pos.y, size.x, size.y);
  }


  boolean inside(PVector p) {
    if (p.x > pos.x) {
      if (p.x < pos.x + size.x) {
        if (p.y > pos.y) {
          if (p.y < pos.y + size.y) {
            if (p.z > pos.z) {
              if (p.z < pos.z + size.z) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }
}
