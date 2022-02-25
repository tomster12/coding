

class Point {


  PVector pos;
  int index;


  Point(PVector pos_, int index_) {
    pos = pos_;
    index = index_;
  }


  void movement() {
    float dX = noise(frameCount * 0.01, index * 1000) * 2 * speed - speed;
    float dY = noise(frameCount * 0.01, index * 1000 + 1000000) * 2 * speed - speed;
    pos.x += dX;
    pos.y += dY;
    if (pos.x < 0) pos.x = 0;
    if (pos.x > width) pos.x = width;
    if (pos.y < 0) pos.y = 0;
    if (pos.y > height) pos.y = height;
  }


  void gravity() {
    for (int i = 0; i < points.size(); i++) {
      if (points.get(i) != this) {
        PVector p = points.get(i).pos;
        PVector dir = p.copy().sub(pos);
        dir.mult(0.01 / dist(pos.x, pos.y, p.x, p.y));
        pos.add(dir);
      }
    }
  }


  void show() {
    noStroke();
    fill(255);
    ellipse(pos.x, pos.y, 5, 5);
    for (int i = 0; i < points.size(); i++) {
     PVector p = points.get(i).pos;
     if (dist(pos.x, pos.y, p.x, p.y) < distance) {
       stroke(50, 50, random(50, 255));
       line(pos.x, pos.y, p.x, p.y);
     }
    }
  }
}
