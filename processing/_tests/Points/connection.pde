class connection {


  float lth;
  float blth;
  point p1;
  point p2;


  connection(float lth_, float blth_, point p1_, point p2_) {
    lth = lth_;
    blth = blth_;
    p1 = p1_;
    p2 = p2_;
  }


  void update() {
    PVector mid;
    mid = p2.pos.copy().sub(p1.pos);
    mid.mult(0.5);
    mid.add(p1.pos);

    PVector dirMp1 = p1.pos.copy().sub(mid).setMag(lth/2); // Middle to point
    PVector dirMp2 = p2.pos.copy().sub(mid).setMag(lth/2);

    PVector gotoP1 = mid.copy().add(dirMp1); // Goto point
    PVector gotoP2 = mid.copy().add(dirMp2);

    PVector dirp1GP1 = gotoP1.sub(p1.pos); // Point to goto point
    PVector dirp2GP2 = gotoP2.sub(p2.pos);

    dirp1GP1.mult(constrain(1 / pow(dirMp1.mag()-lth<0?0:dirMp1.mag()-lth, 2), 0, 0.01)); // Magnitude adjusted force of point to goto point
    dirp2GP2.mult(constrain(1 / pow(dirMp2.mag()-lth<0?0:dirMp2.mag()-lth, 2), 0, 0.01));

    p1.acc.add(dirp1GP1); // Add force
    p2.acc.add(dirp2GP2);

    float d = abs(dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y)); // Check breaking
    if (d > blth) {
      connections.remove(this);
    }
  }

  void show() {
    stroke(255);
    fill(0);
    line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
  }
}
