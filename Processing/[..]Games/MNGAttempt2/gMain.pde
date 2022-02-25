

void gameStart() {
  playing = true;
  gMoney = 0;
  gIncome = 0;

  gTime = new time();
  gPeople = new ArrayList<person>();
  gGrid = new gridSlot[(int)gGridSize.x][(int)gGridSize.y];
  for (int x = 0; x < gGridSize.x; x++) {
    for (int y = 0; y < gGridSize.y; y++) {
      gGrid[x][y] = new gridSlot(new PVector(x, y));
    }
  }

  gotoScreen = new PVector(2, 0);
}



//----------------------------------------


void gameStop() {
  playing = false;

  gTime = null;
}


//-------------------------------------------------------------------------------


void updateGame() {
  if (playing) {
    gTime.update();
    if (gotoScreen.x == 2 && gotoScreen.y == 0) {
      updatePeople();
      updateGrid();
    }
  }
}



//----------------------------------------


void hourTick(int week, int day, int hour) {
  mdMng.getSound("time").play();
}


//----------------------------------------


void updatePeople() {
  for (int i = 0; i < gPeople.size(); i++) {
    int rowNum = floor(i / 6);
    int rowSize = constrain(gPeople.size() - (rowNum * 6), 1, 6);
    int rowPos = i % 6;
    gPeople.get(i).pos = new PVector(380 - (45 * rowSize / 2) + (rowPos * 45), 30 + rowNum * 45);
    gPeople.get(i).update();
  }
}


//----------------------------------------


void updateGrid() {
  for (int x = 0; x < gGrid.length; x++) {
    for (int y = 0; y < gGrid[x].length; y++) {
      gGrid[x][y].update();
    }
  }
}


//-------------------------------------------------------------------------------


void drawGame() {
  if (playing) {
    translate(width * 2, 0);
    drawPeople();
    drawGrid();
    drawPaint();
    if (gPersonSelected != null) {
      drawInfo();
    }
    translate(-width * 2, 0);
  }
}


//----------------------------------------


void drawPeople() {
  for (int i = 0; i < gPeople.size(); i++) {
    gPeople.get(i).show();
  }
}


//----------------------------------------


void drawGrid() {
  float sX = gGridSize.x * gGridSlotSize.x + (gGridSize.x - 1) * gGridSpacing.x;
  float sY = gGridSize.y * gGridSlotSize.y + (gGridSize.y - 1) * gGridSpacing.y;
  noStroke();
  fill(c[1][0]);
  rect(gGridPos.x + 2, gGridPos.y + 2, sX - 4, sY - 4);
  for (int x = 0; x < gGrid.length; x++) {
    for (int y = 0; y < gGrid[x].length; y++) {
      gGrid[x][y].show();
    }
  }
}


//----------------------------------------


void drawPaint() {
  if (gPaint) {
    if (gPersonSelected == null) {
      fill(100, 100, 100, 200);
    } else {
      fill(gPersonSelected.col[0], gPersonSelected.col[1], gPersonSelected.col[2], 200);
    }
    ellipse(trueMouse.x, trueMouse.y, 20, 20);
  }
}


//----------------------------------------


void drawInfo() {
  translate(width, 0);

  noStroke();
  fill(gPersonSelected.col[0], gPersonSelected.col[1], gPersonSelected.col[2]);
  ellipse(650, 45, 50, 50);

  noStroke();
  fill(80);

  textSize(40);
  text("Events", 150, 125);
  text("Work Hours", 650, 125);
  text("Work Conditions", 650, 410);
  text("Relations", 400, 410);

  textSize(30);
  for (int i = 0; i < gPersonSelected.events.size(); i++) {
    text(gPersonSelected.events.get(i), 150, 170 + (gPersonSelected.events.size() - 1- i) * 30);
  }
  for (int i = 0; i < gPersonSelected.workHours.length; i++) {
    text(gPersonSelected.workHours[i][0] + ":00 - " + gPersonSelected.workHours[i][1] + ":00", 650, 170 + i * 30);
  }
  for (int i = 0; i < gPersonSelected.workConditions.size(); i++) {
    text(gPersonSelected.workConditions.get(i), 650, 465 + i * 30);
  }
  for (int i = 0; i < gPersonSelected.relations.size(); i++) {
    relation rel = gPersonSelected.relations.get(i);
    text(gPersonSelected.name == rel.p2.name ? rel.p1.name : rel.p2.name, 400, 465 + i * 30);
  }
  translate(-width, 0);
}


//-------------------------------------------------------------------------------


void updateGameLate() {
  if (playing) {
    if (gotoScreen.x == 2 && gotoScreen.y == 0) {
      if (mouseIsPressed) {
        if (gPersonSelected != null || gPaint) {
          gameClearSelected();
          gPaint = false;
          mdMng.getSound("select").play();
        }
      }
    }
  }
}


//-------------------------------------------------------------------------------


void gameClearSelected() {
  gPersonSelected = null;
  for (int i = 0; i < gPeople.size(); i++) {
    gPeople.get(i).selected = false;
  }
}

//-------------------------------------------------------------------------------


void gameSelectPerson(person p) {
  gameClearSelected();
  gPersonSelected = p;
  p.selected = true;
}
