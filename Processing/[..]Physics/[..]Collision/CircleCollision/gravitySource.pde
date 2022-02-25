

class gravitySource {


  PVector pos;
  float size;




  gravitySource(PVector pos_, float size_) {
    pos = pos_;
    size = size_;
  }




  void update() {
    show();
  }




  void show() {
    noStroke();
    fill(120);
    ellipse(pos.x, pos.y, size, size);
  }
}
