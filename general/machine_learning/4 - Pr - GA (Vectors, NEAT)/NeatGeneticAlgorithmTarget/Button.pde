

class Button {
  // #region - Setup

  PVector pos;
  PVector size;
  String txt;
  int buttonFunctionType;
  boolean hovered;


  Button(PVector pos_, PVector size_, String txt_, int buttonFunctionType_) {
    pos = pos_;
    size = size_;
    txt = txt_;
    buttonFunctionType = buttonFunctionType_;
    hovered = false;
  }

  // #endregion


  // #region - Main Functions

  void update() {
    updateHover();
    show();
  }


  void show() {
    textAlign(CENTER);
    textSize(12);

    stroke(200);
    if (hovered) {
      fill(150, 200);
    } else {
      fill(150, 100);
    }
    rect(pos.x, pos.y, size.x, size.y);

    noStroke();
    fill(255);
    text(txt, pos.x + size.x / 2, pos.y + size.y / 2 + 5);
  }

  // #endregion


  // #region - Checks

  void updateHover() {
    if (checkHover()) {
      hovered = true;
    } else {
      hovered = false;
    }
  }


  boolean checkHover() {
    if (mouseX > pos.x) {
      if (mouseX < pos.x + size.x) {
        if (mouseY > pos.y) {
          if (mouseY < pos.y + size.y) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // #endregion

}
