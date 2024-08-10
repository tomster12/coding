
class player {

  PVector pos;
  float vel;

  float size;
  float rotation;

  color[] camOut;
  String action;


  player(PVector pos_) {
    pos = pos_;
    vel = 0;

    size = 20;
    rotation = 0;

    camOut = new color[camAmount];
  }


  void update() {
    movement();
    cam();
  }


  void movement() {
    if (action == "f") {
      vel += 0.3;
    } else if (action == "b") {
      vel-= 0.3;
    } else if (action == "rl") {
      rotation-= 0.1;
    } else if (action == "rr") {
      rotation +=0.1;
    } else if (action == "sl") {
      pl.pos.add(new PVector(-sin(pl.rotation), cos(pl.rotation)).mult(-2));
    } else if (action == "sr") {
      pl.pos.add(new PVector(-sin(pl.rotation), cos(pl.rotation)).mult(2));
    }
    pos.add(new PVector(cos(rotation) * vel, sin(rotation) * vel));
    vel *= 0.9;
  }


  void cam() {
    camOut = new color[camAmount];
    for (int i = 0; i < camAmount; i++) {
      float angle = i * camRange / (camAmount + 1) - camRange / 2;
      for (float o = 1; o <= camDistance; o += 1) {
        float dX = cos(angle + rotation);
        float dY = sin(angle + rotation);
        PVector cPos = new PVector(dX, dY).mult(o).add(new PVector().normalize().mult(size / 2)).add(pos);
        noStroke();
        fill(0);
        //ellipse(cPos.x, cPos.y, 2, 2);
        boolean found = false;
        ;
        for (int p = 0; p < objects.size(); p++) {
          if (objects.get(p).contains(cPos)) {
            found = true;
            camOut[i] = objects.get(p).col;
            float dMult = pow(1 - ((float)o / (float)camDistance), 2);
            float r = red(camOut[i]) * dMult;
            float g = green(camOut[i]) * dMult;
            float b = blue(camOut[i]) * dMult;
            camOut[i] = color(r, g, b);
            break;
          }
        }
        if (found) {
          break;
        }
      }
    }
  }


  void show() {
    stroke(0);
    fill(100, 100, 100);
    ellipse(pos.x, pos.y, size, size);
    line(pos.x, pos.y, pos.x + cos(rotation) * size / 2, pos.y + sin(rotation) * size / 2);
  }
}
