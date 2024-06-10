

import java.util.Map;
InputManager im;


void setup() {
  size(600, 600);
  textSize(15);
  im = new InputManager();
}


void draw() {
  background(0);
  for (int i = 0; i <= 40; i++) {
    text(""+im.keys.get(i), 0, i*15);
  }
}


void keyPressed() {
  im.input("pressed", keyCode);
}


void keyReleased() {
  im.input("released", keyCode);
}


class InputManager {
  HashMap<Integer,Boolean> keys;
  InputManager() {
    keys = new HashMap<Integer,Boolean>();
  }
  void input(String type, int kCode) {
    if (type == "pressed" || type == "released") {
      keys.put(kCode, type=="pressed");
    }
  }
}
