

class creation {


  PVector startPos;
  float size;


  creation() {
    startPos = new PVector(mouseX, mouseY);
  }



  
  void update() {
    size = 2 * dist(startPos.x, startPos.y, mouseX, mouseY);
    show();
  }




  void show() {
    noStroke();

    if (creationType == 0) {
      fill(120, 100);

    } else if (creationType == 1) {
      fill(200, 100);
    }

    ellipse(startPos.x, startPos.y, size, size);
  }




  void release() {
    if (creationType == 0) {
      gravitySources.add(new gravitySource(startPos, size));

    } else if (creationType == 1) {
      objects.add(new object(startPos, size));
    }
  }
}
