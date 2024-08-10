class point {


  PVector pos;
  PVector vel;
  PVector acc;
  float size;


  point(PVector pos_, float size_) {
    pos = pos_;
    size = size_;

    vel = new PVector(0, 0);
    acc = new PVector(0, 0);
  }


  void update() {
    vel.add(acc);
    pos.add(vel);
    acc.mult(0);
    vel.mult(0.95);

    for (int o = 0; o < points.size(); o++) {
      if (points.get(o) != this) {
        point p1 = this;
        point p2 = points.get(o);

        float connectDistance = getConnectionDistance(p1.size, p2.size);
        float connectionDistance = getConnectionDistance(p1.size, p2.size);

        if (dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y) < connectDistance) {
          boolean found = false;
          for (int p = 0; p < connections.size(); p++) {
            connection c = connections.get(p);
            if ((c.p1 == p1 && c.p2 == p2) || (c.p2 == p1 && c.p1 == p2)) {
              found = true;
            }
          }

          if (!found) {
            connections.add(new connection(connectionDistance, connectDistance * 1.2, p1, p2));
          }
        }
      }
    }
  }


  void show() {
    stroke(255);
    noFill();
    ellipse(pos.x, pos.y, size, size);
  }
}
