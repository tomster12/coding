

class gridSlot {


  PVector pos;
  person personAssigned;


  //-------------------------------------------------------------------------------


  gridSlot(PVector pos_) {
    pos = pos_;
  }


  //-------------------------------------------------------------------------------


  void update() {
    if (hoverOver() && mouseIsPressed && personAssigned != null && !gPaint) {
      gameSelectPerson(personAssigned);
      mouseIsPressed = false;
    }

    if (hoverOver() && mousePressed && gPaint) {
      change(gPersonSelected);
      mouseIsPressed = false;
    }
  }


  //-------------------------------------------------------------------------------


  void show() {
    noStroke();
    if (personAssigned != null) {
      fill(personAssigned.col[0], personAssigned.col[1], personAssigned.col[2]);
    } else {
      fill(c[0][0]);
    }
    rect(pos.x * (gGridSlotSize.x + gGridSpacing.x) + gGridPos.x, pos.y * (gGridSlotSize.y + gGridSpacing.y) + gGridPos.y, gGridSlotSize.x, gGridSlotSize.y);
  }


  //------------------------------------------------------------------------------- 


  void change(person toSelect) {
    if (toSelect != personAssigned) {
      personAssigned = toSelect;
      mdMng.getSound("paint").play();
    }
  }



  //-------------------------------------------------------------------------------


  boolean hoverOver() {
    float pX = pos.x * (gGridSlotSize.x + gGridSpacing.x) + gGridPos.x;
    float pY = pos.y * (gGridSlotSize.y + gGridSpacing.y) + gGridPos.y;
    if (trueMouse.x > pX
      && trueMouse.x < pX + gGridSlotSize.x
      && trueMouse.y > pY 
      && trueMouse.y < pY + gGridSlotSize.y) {
      return true;
    }
    return false;
  }
}


//-------------------------------------------------------------------------------
