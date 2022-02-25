

void allSetup() {
  setupVariables();
  setupScreens();
  mdMng.getSound("music1").loop();
}


//-------------------------------------------------------------------------------


void setupVariables() {
  mdMng = new mediaManager(this);
  names = new String[2][][];
  names[0] = new String[2][];
  names[1] = new String[1][];
  names[0][0] = loadStrings("names/boyFirst.txt");
  names[0][1] = loadStrings("names/girlFirst.txt");
  names[1][0] = loadStrings("names/last.txt");

  PFont font = createFont("font.ttf", 20);
  textFont(font);
}


//-------------------------------------------------------------------------------


void setupScreens() {
  setupScreenSettings();
  setupScreenIntro();
  setupScreenMenu();
  setupScreenGame();
  setupScreenInfo();
}


//---------------------------------------- Settings


void setupScreenSettings() {
  screen settings = new screen(new PVector(1, -1));


  settings.buttons.add(new button( // Down movement button
    settings,
    new PVector(400, 750),
    new PVector(50, 50),
    PI,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("menuArrow"))
  {
    @Override public void action () {
      screenMove(new PVector(0, 1));
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
    }
    @Override public void bShow() {
    }
  }
  );


  settings.sliders.add(new slider( // Total slider
    settings,
    new PVector(325, 350),
    new PVector(150, 25),
    0.5));

  settings.sliders.add(new slider( // Music slider
    settings,
    new PVector(325, 400),
    new PVector(150, 25),
    0.01));

  settings.sliders.add(new slider( // SFX slider
    settings,
    new PVector(325, 450),
    new PVector(150, 25),
    1));


  settings.texts.add(new textObject( // Settings title text
    "Settings",
    new PVector(400, 270),
    100)
  {
    @Override public void update () {
    }
  }
  );

  settings.texts.add(new textObject( // Total text
    "Total",
    new PVector(275, 360),
    40)
  {
    @Override public void update () {
    }
  }
  );

  settings.texts.add(new textObject( // Music text
    "Music",
    new PVector(275, 410),
    40)
  {
    @Override public void update () {
    }
  }
  );

  settings.texts.add(new textObject( // SFX text
    "SFX",
    new PVector(275, 460),
    40)
  {
    @Override public void update () {
    }
  }
  );


  screens.add(settings);
}


//------------------------------------- Intro


void setupScreenIntro() {
  screen intro = new screen(new PVector(0, 0)); // Right movement button


  intro.buttons.add(new button(
    intro,
    new PVector(750, 400),
    new PVector(50, 50),
    PI / 2,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("menuArrow"))
  {
    @Override public void action () {
      screenMove(new PVector(1, 0));
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
    }
    @Override public void bShow() {
    }
  }
  );


  intro.texts.add(new textObject( // Title text
    "M.N.G",
    new PVector(400, 440),
    120)
  {
    @Override public void update () {
    }
  }
  );


  screens.add(intro);
}


//------------------------------------- Menu


void setupScreenMenu() {
  screen menu = new screen(new PVector(1, 0));


  menu.buttons.add(new button( // Right movement button
    menu,
    new PVector(750, 400),
    new PVector(50, 50),
    PI / 2,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("menuArrow"))
  {
    @Override public void action () {
      screenMove(new PVector(1, 0));
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
      if (playing) {
        locked = false;
        hoverSize = true;
      } else {
        locked = true;
        hoverSize = false;
      }
    }
    @Override public void bShow() {
    }
  }
  );

  menu.buttons.add(new button(  // Left movement button
    menu,
    new PVector(50, 400),
    new PVector(50, 50),
    3 * PI / 2,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("menuArrow"))
  {
    @Override public void action () {
      screenMove(new PVector(-1, 0));
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
    }
    @Override public void bShow() {
    }
  }
  );

  menu.buttons.add(new button(  // Up movement button
    menu,
    new PVector(400, 50),
    new PVector(50, 50),
    0,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("menuArrow"))
  {
    @Override public void action () {
      screenMove(new PVector(0, -1));
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
    }
    @Override public void bShow() {
    }
  }
  );

  menu.buttons.add(new button( // Difficulty up button
    menu,
    new PVector(490, 400),
    new PVector(40, 40),
    0,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("difficulty"))
  {
    @Override public void action () {
      difficulty++;
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
      if (difficulty < 2 && !playing) {
        locked = false;
        hoverSize = true;
      } else {
        locked = true;
        hoverSize = false;
      }
    }
    @Override public void bShow() {
    }
  }
  );

  menu.buttons.add(new button( // Difficulty down button
    menu,
    new PVector(540, 400),
    new PVector(40, 40),
    PI,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("difficulty"))
  {
    @Override public void action () {
      difficulty--;
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
      if (difficulty > 0 && !playing) {
        locked = false;
        hoverSize = true;
      } else {
        locked = true;
        hoverSize = false;
      }
    }
    @Override public void bShow() {
    }
  }
  );

  menu.buttons.add(new button( // Play button
    menu,
    new PVector(525, 550),
    new PVector(75, 75),
    PI / 2,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("stop"),
    mdMng.getSound("startStop"))
  {
    @Override public void action () {
      if (!locked) {
        gameStart();
      } else {
        gameStop();
      }
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
      if (playing) {
        locked = true;
      } else {
        locked = false;
      }
      if (mouseIsPressed && hoverOver()) {
        action();
        mouseIsPressed = false;
      }
    }
    @Override public void bShow() {
    }
  }
  );


  menu.texts.add(new textObject( // Menu title text
    "Menu",
    new PVector(400, 270),
    100)
  {
    @Override public void update () {
    }
  }
  );

  menu.texts.add(new textObject( // Difficulty: text
    "Difficulty:",
    new PVector(300, 410),
    40)
  {
    @Override public void update () {
    }
  }
  );

  menu.texts.add(new textObject( // Difficulty display text
    "Difficulty",
    new PVector(405, 410),
    40)
  {
    @Override public void update () {
      if (difficulty == 0) {
        text = "Easy";
        col = c[2];
      } else if (difficulty == 1) {
        text = "Medium";
        col = c[3];
      } else if (difficulty == 2) {
        text = "Hard";
        col = c[4];
      }
    }
  }
  );

  menu.texts.add(new textObject( // Play button text
    "N/A",
    new PVector(350, 560),
    40)
  {
    @Override public void update () {
      if (playing) {
        text = "Playing";
      } else {
        text = "Not Playing";
      }
    }
  }
  );

  screens.add(menu);
}


//---------------------------------------- Game


void setupScreenGame() {
  screen game = new screen(new PVector(2, 0));


  game.buttons.add(new button( // Right movement button
    game,
    new PVector(750, 400),
    new PVector(50, 50),
    PI / 2,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("menuArrow"))
  {
    @Override public void action () {
      screenMove(new PVector(1, 0));
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
      if (gPersonSelected == null) {
        locked = true;
        hoverSize = false;
      } else {
        locked = false;
        hoverSize = true;
      }
    }
    @Override public void bShow() {
    }
  }
  );

  game.buttons.add(new button( // Left movement button
    game,
    new PVector(50, 400),
    new PVector(50, 50),
    3 * PI / 2,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("menuArrow"))
  {
    @Override public void action () {
      screenMove(new PVector(-1, 0));
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
    }
    @Override public void bShow() {
    }
  }
  );


  game.buttons.add(new button( // Paint button
    game,
    new PVector(220, 730),
    new PVector(50, 50),
    0,
    mdMng.getImage("brush"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("select"))
  {
    @Override public void action () {
      gPaint = !gPaint;
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
    }
    @Override public void bShow() {
      float mult = 1;
      if (hoverOver() && hoverSize) {
        mult = 1.2;
      }
      stroke(c[1][0]);
      strokeWeight(2);
      noFill();
      ellipse(pos.x, pos.y, 45 * mult, 45 * mult);
      strokeWeight(1);
    }
  }
  );

  game.buttons.add(new button( // Unpaint button
    game,
    new PVector(500, 730),
    new PVector(50, 50),
    0,
    mdMng.getImage("brush"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("paint"))
  {
    @Override public void action () {
      onClick.play();
      for (int i = 0; i < gGrid.length; i++) {
        for (int o = 0; o < gGrid[i].length; o++) {
          gGrid[i][o].personAssigned = null;
        }
      }
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
    }
    @Override public void bShow() {
      float mult = 1;
      if (hoverOver() && hoverSize) {
        mult = 1.2;
      }
      noStroke();
      fill(c[1][0]);
      ellipse(pos.x, pos.y, 45 * mult, 45 * mult);
    }
  }
  );


  game.texts.add(new textObject( // Display seconds since start
    "time",
    new PVector(50, 30),
    30)
  {
    @Override public void update () {
      if (gTime != null) {
        String rString1 = nf(floor((frameCount - gTime.startFrame) / (60)) % 60, 2);
        String rString2 = nf(floor((frameCount - gTime.startFrame) / (60*60)) % 60, 2);
        String rString3 = nf(floor((frameCount - gTime.startFrame) / (60*60*60)) & 60, 2);
        String nString = "" + rString3+ ":" + rString2 + ":" + rString1;
        text = nString;
      }
    }
  }
  );

  game.texts.add(new textObject( // Display week
    "week",
    new PVector(50, 60),
    30)
  {
    @Override public void update () {
      if (gTime != null) {
        text = "Week: " + gTime.week;
      }
    }
  }
  );

  game.texts.add(new textObject( // Display day
    "day",
    new PVector(50, 90),
    30)
  {
    @Override public void update () {
      if (gTime != null) {
        text = "Day: " + gTime.day % 7;
      }
    }
  }
  );

  game.texts.add(new textObject( // Display hour
    "hour",
    new PVector(50, 120),
    30)
  {
    @Override public void update () {
      if (gTime != null) {
        text = "Hour: " + gTime.hour % 24;
      }
    }
  }
  );

  game.texts.add(new textObject( // Display money
    "money",
    new PVector(720, 30),
    30)
  {
    @Override public void update () {
      text = "Money: £" + (nf(gMoney, 4, 2));
    }
  }
  );

  game.texts.add(new textObject( // Display income
    "income",
    new PVector(720, 60),
    30)
  {
    @Override public void update () {
      text = "Income: £" + (nf(gIncome, 4, 2));
    }
  }
  );

  String[] days = new String[] {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
  for (int i = 0; i < 7; i++) {
    final String day = days[i];
    game.texts.add(new textObject( // Display days
      "day",
      new PVector(222.5 + i * (2 + gGridSlotSize.x), 120),
      20)
    {
      @Override public void update () {
        text = day;
      }
    }
    );
  }

  for (int i = 0; i < 13; i++) {
    final String time = "" + (7 + i) + ":00";
    game.texts.add(new textObject( // Display days
      "day",
      new PVector(175, 135 + i * (2 + gGridSlotSize.y)),
      20)
    {
      @Override public void update () {
        text = time;
      }
    }
    );
  }


  screens.add(game);
}


//------------------------------------- Info


void setupScreenInfo() {
  screen info = new screen(new PVector(3, 0));


  info.buttons.add(new button( // Left movement button
    info,
    new PVector(50, 400),
    new PVector(50, 50),
    3 * PI / 2,
    mdMng.getImage("arrowIdle"),
    mdMng.getImage("arrowLocked"),
    mdMng.getSound("menuArrow"))
  {
    @Override public void action () {
      screenMove(new PVector(-1, 0));
      onClick.play();
      mouseIsPressed = false;
    }
    @Override public void bUpdate () {
    }
    @Override public void bShow() {
    }
  }
  );


  info.texts.add(new textObject( // Display name
    "name",
    new PVector(400, 60),
    55)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = gPersonSelected.name;
      }
    }
  }
  );


  info.texts.add(new textObject( // Display age
    "age",
    new PVector(400, 110),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = "Age: " + gPersonSelected.age;
      }
    }
  }
  );

  info.texts.add(new textObject( // Display gender
    "gender",
    new PVector(400, 140),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = "Gender: " + new String[] {"Male", "Female"} [gPersonSelected.gender];
      }
    }
  }
  );

  info.texts.add(new textObject( // Display mood
    "mood",
    new PVector(400, 170),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = "Mood: " + gPersonSelected.mood;
      }
    }
  }
  );

  info.texts.add(new textObject( // Display satisfaction
    "satisfaction",
    new PVector(400, 200),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = "Satisfaction: " + gPersonSelected.satisfaction;
      }
    }
  }
  );

  info.texts.add(new textObject( // Display illness
    "illness",
    new PVector(400, 230),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null ) {
        if (gPersonSelected.ill == null) {
          text = "No Illness";
        } else {
          text = "Illness: " + gPersonSelected.ill.name + ", " + gPersonSelected.ill.time + " days left";
        }
      }
    }
  }
  );

  info.texts.add(new textObject( // Display work rate
    "work rate",
    new PVector(400, 260),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = "Work Rate: " + nf(gPersonSelected.workRate, 2, 2);
      }
    }
  }
  );

  info.texts.add(new textObject( // Display wage
    "wage",
    new PVector(400, 290),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = "Wage: " + nf(gPersonSelected.wage, 2, 2);
      }
    }
  }
  );

  info.texts.add(new textObject( // Display work done
    "work done",
    new PVector(400, 320),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = "Work Done: " + gPersonSelected.workDone;
      }
    }
  }
  );

  info.texts.add(new textObject( // Display work threshold
    "work threshold",
    new PVector(400, 350),
    30)
  {
    @Override public void update () {
      if (playing && gPersonSelected != null) {
        text = "Work Threshold: " + gPersonSelected.workThreshold;
      }
    }
  }
  );


  screens.add(info);
}


//--------------------------------------------------------------------------------
