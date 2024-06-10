

class slider {


  screen pScreen;

  PVector pos;
  PVector size;

  float sliderPos;
  float brightness;
  boolean hover;


  //-------------------------------------------------------------------------------


  slider(screen pScreen_, PVector pos_, PVector size_, float sliderPos_) {
    pScreen = pScreen_;

    pos = pos_;
    size = size_;
    sliderPos = sliderPos_;

    brightness = c[5][0];
    hover = false;
  }


  //-------------------------------------------------------------------------------


  void show() {
    fill(brightness);
    ellipse(pos.x, pos.y, size.y, size.y);
    rect(pos.x, pos.y - size.y / 2, size.x, size.y);
    ellipse(pos.x + size.x, pos.y, size.y, size.y);

    fill(c[1][0]);
    ellipse(pos.x + (size.x * sliderPos), pos.y, size.y, size.y);
  }


  //-------------------------------------------------------------------------------


  void update() {
    if (hoverOver()) {
      hover = true;
    } else {
      hover = false;
    }

    if (hover && mousePressed) {
      sliderPos = (constrain(trueMouse.x, pos.x, pos.x + size.x) - pos.x) / size.x;
    }

    if (hover && brightness < c[5][1]) {
      brightness+=2;
    } else if (!hover && brightness > c[5][0]) {
      brightness-=2;
    }
  }


  //-------------------------------------------------------------------------------


  boolean hoverOver() {
    if (dist(trueMouse.x, trueMouse.y, pos.x, pos.y) < size.y / 2) {
      return true;
    }
    if (dist(trueMouse.x, trueMouse.y, pos.x + size.x, pos.y) < size.y / 2) {
      return true;
    }
    if (trueMouse.x > pos.x && trueMouse.x < pos.x + size.x) {
      if (trueMouse.y > pos.y - size.y / 2 && trueMouse.y < pos.y + size.y / 2) {
        return true;
      }
    }
    return false;
  }
}

//-------------------------------------------------------------------------------
