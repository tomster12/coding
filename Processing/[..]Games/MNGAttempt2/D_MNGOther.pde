

void keyPressed() {

  if (keyCode > 36 && keyCode < 41) {
    if (screenMove(new PVector(round(-sin(keyCode * PI / 2)), round(cos(keyCode * PI / 2))))) {
      mdMng.getSound("menuArrow").play();
    }
  }

  if (playing) {
    if (keyCode == 9) {
      person p = new person();
      gPeople.add(p);
      gameSelectPerson(p);
    }

    if (gPersonSelected != null) {
      if (keyCode ==69) {
        for (int i = 0; i < gPeople.size(); i++) {
          float amn = random(-1, 1);
          gPeople.get(i).events.add("" + (new String[] {"Happiness ", "Satisfaction ", "Work rate "}[floor(random(3))]) + (amn > 0 ? "+" : "") + nf(amn, 1, 2));
        }
      }
    }

    if (keyCode == 81 || keyCode == 87) {
      if (gPersonSelected != null) {
        for (int i = 0; i < gPeople.size(); i++) {
          if (gPeople.get(i) == gPersonSelected) {
            if (keyCode == 81) {
              gameSelectPerson(gPeople.get((i == 0 ? gPeople.size() - 1 : (i - 1) % gPeople.size())));
            } else if (keyCode == 87) {
              gameSelectPerson(gPersonSelected = gPeople.get((i + 1) % gPeople.size()));
            }
            break;
          }
        }
      } else {
        if (gPeople.size() > 0) {
          gameSelectPerson(gPeople.get(0));
        }
      }
    }
  }
}


//----------------------------------------


void mousePressed() {
  mouseIsPressed = true;
}

//-------------------------------------------------------------------------------



boolean screenMove(PVector dir) {
  PVector nGotoScreen = gotoScreen.copy().add(dir);

  if (nGotoScreen.x == 2 && nGotoScreen.y == 0 && !playing) {
    return false;
  }
  if (nGotoScreen.x == 3 && nGotoScreen.y == 0 && gPersonSelected == null) {
    return false;
  }
  boolean found = false;
  for (int i = 0; i < screens.size(); i++) {
    if (screens.get(i).pos.x == nGotoScreen.x && screens.get(i).pos.y == nGotoScreen.y) {
      found = true;
      break;
    }
  }

  if (found) {
    gotoScreen = nGotoScreen.copy();
    return true;
  }

  return false;
}


//-------------------------------------------------------------------------------
