

abstract class button {


  screen pScreen;

  PVector pos;
  PVector size;
  float rotation;

  PImage i1;
  PImage i2;
  SoundFile onClick;

  boolean locked;
  boolean hoverSize;


  //-------------------------------------------------------------------------------


  button(screen pScreen_, PVector pos_, PVector size_, float rotation_, PImage i1_, PImage i2_, SoundFile onClick_) {
    pScreen = pScreen_;
    pos = pos_;
    size = size_;
    rotation = rotation_;

    i1 = i1_;
    i2 = i2_;
    onClick = onClick_;

    locked = false;
    hoverSize = true;
  }


  //-------------------------------------------------------------------------------


  void update() {
    bUpdate();
    if (mouseIsPressed && hoverOver() && !locked) {
      action();
    }
  }


  //-------------------------------------------------------------------------------


  void show() {
    translate(pos.x, pos.y);
    rotate(rotation);

    noStroke();
    fill(c[1][0]);

    float mult = 1;
    if (hoverOver() && hoverSize) {
      mult = 1.2;
    }
    if (locked) {
      PImage ti2 = i2.copy();
      ti2.resize(ceil(mult * size.x), ceil(mult * size.y));
      translate((mult * -size.x) / 2, (mult * -size.y) / 2);
      image(ti2, 0, 0);
      translate((mult * size.x) / 2, (mult * size.y) / 2);
    } else {
      PImage ti1 = i1.copy();
      ti1.resize(ceil(mult * size.x), ceil(mult * size.y));
      translate(-(mult * size.x) / 2, -(mult * size.y) / 2);
      image(ti1, 0, 0);
      translate((mult * size.x) / 2, (mult * size.y) / 2);
    }

    rotate(-rotation);
    translate(-pos.x, -pos.y);
    
    bShow();
  }


  //-------------------------------------------------------------------------------


  boolean hoverOver() {
    if (trueMouse.x > pos.x - size.x / 2 && trueMouse.x < pos.x + size.x / 2) {
      if (trueMouse.y > pos.y - size.y / 2 && trueMouse.y < pos.y + size.y / 2) {
        return true;
      }
    }
    return false;
  }


  //-------------------------------------------------------------------------------


  abstract public void action();
  abstract public void bUpdate();
  abstract public void bShow();
}


//-------------------------------------------------------------------------------
