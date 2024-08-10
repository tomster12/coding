

void allUpdate() {
  updateMousePos();
  updateSound();
  updateScreenChange();
  updateGame();
  updateScreens();
  updateGameLate();
  updateOther();
}


//----------------------------------------


void updateMousePos() {
  trueMouse.x = mouseX - gotoScreen.x * width + currentScreen.x * width;  
  trueMouse.y = mouseY - gotoScreen.y * height + currentScreen.y * height;
}


//----------------------------------------


void updateSound() {
  float tot = constrain(screens.get(0).sliders.get(0).sliderPos, 0.001, 1);
  float music = constrain(screens.get(0).sliders.get(1).sliderPos, 0.001, 1);
  float sfx = constrain(screens.get(0).sliders.get(2).sliderPos, 0.001, 1);
  mdMng.getSound("music1").amp(tot * music);
  mdMng.getSound("menuArrow").amp(tot * sfx);
  mdMng.getSound("startStop").amp(tot * sfx);
  mdMng.getSound("difficulty").amp(tot * sfx);
  mdMng.getSound("paint").amp(tot * sfx);
  mdMng.getSound("select").amp(tot * sfx);
  mdMng.getSound("time").amp(tot * sfx);
}


//----------------------------------------


void updateScreenChange() {
  if (currentScreen.x != gotoScreen.x || currentScreen.y != gotoScreen.y) {
    currentScreen.add(gotoScreen.copy().sub(currentScreen).mult(0.1));
    if (dist(currentScreen.x, currentScreen.y, gotoScreen.x, gotoScreen.y) < 0.002) {
      currentScreen = gotoScreen.copy();
    }
  }
}


//----------------------------------------


void updateScreens() {
  for (int i = 0; i < screens.size(); i++) {
    screens.get(i).update();
  }
}


//----------------------------------------


void updateOther() {
  mouseIsPressed = false;
}


//--------------------------------------------------------------------------------
