
class object {

  PVector pos;
  PVector size;
  color col;


  object(PVector pos_, PVector size_, color col_) {
    pos = pos_;
    size = size_;
    col = col_;
  }


  void show() {
    noStroke();
    fill(col);
    rect(pos.x, pos.y, size.x, size.y);
  }


  boolean contains(PVector p) {
    if (p.x > pos.x && p.x < pos.x + size.x && p.y > pos.y && p.y < pos.y + size.y) {
      return true;
    }
    return false;
  }
}
