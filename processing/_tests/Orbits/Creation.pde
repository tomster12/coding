

class Creation {
  
  
  PVector pos;
  float size;
  
  
  Creation(PVector pos_) {
    pos = pos_;
  }
  
  
  void update() {
    size = dist(pos.x, pos.y, mouseX, mouseY) * 2;
    show();
  }
  
  
  void show() {
    noStroke();
    fill(100, 150);
    ellipse(pos.x, pos.y, size, size); 
  }
  
  
  void create() {
    PVector dir = pos.sub(center);
    float angle = PVector.angleBetween(new PVector(1, 0), dir.copy().normalize());
    if (mouseY < center.y) {
      angle *= -1; 
    }
    float distance = dir.mag();
    orbiters.add(new Orbiter(angle, random(0.001, 0.05), distance, size));
    currentCreation = null;
  }
}
