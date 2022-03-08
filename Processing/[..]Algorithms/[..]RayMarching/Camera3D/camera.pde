class camera {


  PVector pos;
  PVector vel;
  float dirLR;
  float dirUD;
  color[][] camOut;


  camera(PVector pos_) {
    pos = pos_;
    vel = new PVector(0, 0);
    dirLR = 0;
    camOut = new color[(int)camSize.x][(int)camSize.y];
  }


  void show() {
    noStroke();
    fill(200);
    ellipse(pos.x, pos.y, 10, 10);

    stroke(200);
    noFill();

    line(pos.x, pos.y, pos.x + cos(dirLR) * camDistance, pos.y + sin(dirLR) * camDistance);
    line(pos.x, pos.y, pos.x + cos(dirLR + camRangeLR / 2) * camDistance, pos.y + sin(dirLR + camRangeLR / 2) * camDistance);
    line(pos.x, pos.y, pos.x + cos(dirLR - camRangeLR / 2) * camDistance, pos.y + sin(dirLR - camRangeLR / 2) * camDistance);
  }


  void camUpdate() {
    pos.add(vel);
    vel.x *= 0.9;
    vel.y *= 0.9;
    if (pos.z > 10) {
      vel.z -= 1;
    }
    if (pos.z < 10) {
      vel.z = 0;
      pos.z = 10;
    }
    
    noStroke();
    fill(200);
    
    for (int x = 0; x < camSize.x; x++) {
      float cDirLR = (dirLR - camRangeLR / 2) + (camRangeLR / (camSize.x + 1)) * (x+1);
      
      for (int y = 0; y < camSize.y; y++) {
        float cDirUD = (dirUD + camRangeUD / 2) - (camRangeUD / (camSize.y + 1)) * (y+1);
        
        PVector xy = new PVector(cos(cDirLR), sin(cDirLR)).mult(cos(cDirUD));
        PVector d = new PVector(xy.x, xy.y, sin(cDirUD));
        
        boolean found = false;
        for (int i = 0; i < camCheckAmount; i++) {
          PVector p = pos.copy().add(d.copy().mult(camDistance * i / camCheckAmount));
          
          camOut[x][y] = color(100, 100, 100);
          for (int o = 0; o < objects.size(); o++) {
            if (objects.get(o).inside(p)) {
              camOut[x][y] = objects.get(o).col; 
              found = true;
              break;
            }
          }
          
          if (found) {
           break; 
          }
        }
      }
    }
  }


  void kp(int k) {
    if (k == 37) {
      vel.add(new PVector(cos(dirLR-PI/2), sin(dirLR-PI/2)));
    }
    if (k == 38) {
      vel.add(new PVector(cos(dirLR), sin(dirLR)));
    }
    if (k == 39) {
      vel.add(new PVector(cos(dirLR+PI/2), sin(dirLR+PI/2)));
    }
    if (k == 40) {
      vel.add(new PVector(cos(dirLR-PI), sin(dirLR-PI)));
    }
    if (k == 81) {
      dirLR -= 0.02;
    }
    if (k == 69) {
      dirLR += 0.02;
    }
    if (k == 32) {
      vel.add(new PVector(0, 0, 10));
    }
  }
}
