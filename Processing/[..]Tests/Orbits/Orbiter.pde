class Orbiter {


  float angle;
  float speed;
  float distance;
  float size;

  color headCol;
  color tailCol;
  ArrayList<PVector> path;
  PVector pos;


  Orbiter(float angle_, float speed_, float distance_, float size_) {
    angle = angle_;
    speed = speed_;
    distance = distance_;
    size = size_;

    headCol = color(random(100), random(100), random(100));
    tailCol = color(random(100), random(100), random(100));
    path = new ArrayList<PVector>();
  }


  void update() {
    updatePos();
    show();
  }


  void updatePos() {
    angle += speed;
    pos = new PVector(center.x + cos(angle) * distance, center.y + sin(angle) * distance);

     path.add(pos);
    if (path.size() > pathLength) {
      path.remove(0);
    }
  }


  void show() {
    if (path.size() > 1) {
      noStroke();
      fill(tailCol);
      
      beginShape();
      for (int i = 0, dir = 1; !(dir == -1 && i == 0); i += dir) {        
        if (i == path.size() - 1) {
          dir = -1;
        }
        PVector p1 = path.get(i);
        PVector p2 = path.get(i + dir);
        PVector norm = getNorm(p1, p2);
        float adjustedLength = tf(i, path.size() - 1) * size/2;
        norm.mult(adjustedLength);
        vertex(p1.x + norm.x, p1.y + norm.y);
      }
      endShape();
    }


    noStroke();
    fill(headCol);
    ellipse(pos.x, pos.y, size, size);
  }
}
