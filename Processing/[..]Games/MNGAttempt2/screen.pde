

class screen {


  PVector pos;
  ArrayList<button> buttons;
  ArrayList<slider> sliders;
  ArrayList<textObject> texts;


  //-------------------------------------------------------------------------------


  screen(PVector pos_) {
    pos = pos_;

    buttons = new ArrayList<button>();
    sliders = new ArrayList<slider>();
    texts = new ArrayList<textObject>();
  }


  //-------------------------------------------------------------------------------


  void show() {
    translate(pos.x * width, pos.y * height);
    for (int i = 0; i < buttons.size(); i++) {
      buttons.get(i).show();
    }
    for (int i = 0; i < sliders.size(); i++) {
      sliders.get(i).show();
    }
    for (int i = 0; i < texts.size(); i++) {
      texts.get(i).show();
    }
    translate(-pos.x * width, -pos.y * height);
  }


  //-------------------------------------------------------------------------------


  void update() {
    if (pos.x == gotoScreen.x && pos.y == gotoScreen.y) {
      for (int i = 0; i < buttons.size(); i++) {
        buttons.get(i).update();
      }
      for (int i = 0; i < sliders.size(); i++) {
        sliders.get(i).update();
      }
      for (int i = 0; i < texts.size(); i++) {
        texts.get(i).update();
      }
    }
  }
}


//-------------------------------------------------------------------------------
