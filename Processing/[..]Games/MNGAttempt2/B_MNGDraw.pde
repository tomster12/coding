

void allDraw() {
  drawMain();
  drawScreens();
  drawGame();
  //drawDebug();
}


//----------------------------------------


void drawMain() {   
  background(c[0][0]); 
  translate(-currentScreen.x * width, -currentScreen.y * height);
}


//----------------------------------------


void drawScreens() {
  for (int i = 0; i < screens.size(); i++) {
    screens.get(i).show();
  }
}


//----------------------------------------


void drawDebug() {
  fill(0);
  translate(currentScreen.x * width, currentScreen.y * height);
  textSize(20);
  text(currentScreen.x, 50, 50);
  text(currentScreen.y, 50, 70);
  text(gotoScreen.x, 50, 90);
  text(gotoScreen.y, 50, 110);
  text(trueMouse.x, 50, 130);
  text(trueMouse.y, 50, 150);

  if (gPersonSelected != null) {
    fill(gPersonSelected.col[0], gPersonSelected.col[1], gPersonSelected.col[2]);
    ellipse(140, 145, 20, 20);
    fill(0);
    text(gPersonSelected.name, 50, 180);
    text(gPersonSelected.age, 50, 200);
    text(gPersonSelected.gender, 50, 220);
    text("£" + nf(gPersonSelected.wage, 2, 2) + "/hr", 50, 240);
    text(gPersonSelected.mood, 50, 260);
    text(gPersonSelected.satisfaction, 50, 280);
    text(gPersonSelected.workRate, 50, 300);
    for (int i = 0; i < gPersonSelected.workHours.length; i++) {
      text(gPersonSelected.workHours[i][0] + ":00 - " + gPersonSelected.workHours[i][1] + ":00", 140, 180 + i * 20);
    }
    for (int i = 0; i < gPersonSelected.workConditions.size(); i++) {
      text(gPersonSelected.workConditions.get(i), 140, 300 + i * 20);
    }
  }

  if (gTime != null) {
    text("" + nf((frameCount - gTime.startFrame), 6), 50, 340);
    text("Week: " + gTime.week, 50, 360);
    text("Day: " + gTime.day % 7, 50, 380);
    text("Hour: " + gTime.hour % 24, 50, 400);
  }
}


//--------------------------------------------------------------------------------
