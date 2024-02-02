

class bot {


  PVector pos;
  PVector adjustPos;

  float direction;
  float movement;
  float rotation;

  float size;
  String action;
  ArrayList<info> infoOut;
  ArrayList<info> infoIn;
  ArrayList<info> infoFinal;
  int infoFinalSize;


  bot(PVector pos_, float size_) {
    pos = pos_;
    adjustPos = new PVector(0, 0);

    direction = 0;
    movement = 0;
    rotation = 0;

    size = size_;
    action = "Searching";
    infoOut = new ArrayList<info>();
    infoIn = new ArrayList<info>();
    infoFinal = new ArrayList<info>();
    infoFinalSize = 8;
  }


  //----------------------------------------------------------------------------- 


  void collide() {
    infoOut = new ArrayList<info>();

    infoOut.add(new info(true, 0)); // Initial tap
    if (infoFinal.size() > 0) {
      infoOut.add(new info(true, tapWait));
    }

    for (int i = 0; i < 10; i++) {
      infoOut.add(new info(false, tapWait * 75)); // Proceeding taps with wait
      infoOut.add(new info(true, 60/10)); // Tap after waiting for rotation
      if (infoFinal.size() > 0) {
        infoOut.add(new info(true, tapWait));
      }
    }
  }


  void collideResponse() {
    infoOut = new ArrayList<info>();

    if (infoIn.size() == 3) { // If go away - Response
      sendTap(); 
      movement = -100;
      startBots();
      infoIn = new ArrayList<info>(); // Response received
      infoOut = new ArrayList<info>(); // setup for data
    } else if (infoIn.size() == 4) { // If stay - Response
      infoOut = new ArrayList<info>();
      sendTap(); 
      if (infoFinal.size() == 0) {
        action = "InfoIn";
        infoOut = new ArrayList<info>();
      } else {
        action = "InfoOut";
        for (int i = 0; i < infoFinal.size(); i++) {
          infoOut.add(infoFinal.get(i));
        }
      }
      infoIn = new ArrayList<info>(); // Response received
    } else { // If the tap is a request
      int amn = 0;

      if (infoFinal.size() > 0) { // If i have data
        if (infoIn.size() == 2) { // And so does the other 
          amn = 2; // Tap go away
        } else if (infoIn.size() == 1) { // And the other doesnt
          amn = 3; // Tap accept
        }
      } else { // If i dont have data
        if (infoIn.size() == 2) { // If the other does 
          amn = 3; // Tap accept
        } else if (infoIn.size() == 1) { // If the other doesnt
          amn = 2; // Tap go away
        }
      }

      infoOut.add(new info(true, 0)); // Initial tap
      for (int i = 0; i < amn; i++) {
        infoOut.add(new info(true, tapWait));
      }

      for (int i = 0; i < 10; i++) {
        infoOut.add(new info(false, tapWait * 2)); // Proceeding tap with wait
        infoOut.add(new info(true, 60/10)); // Tap after waiting for rotation
        for (int o = 0; o < amn; o++) {
          infoOut.add(new info(true, tapWait));
        }
      }
      action = "CollisionR";
    }
  }


  void action() {
    if (action == "Searching") {
      if (movement == 0 && rotation == 0) {
        if (random(1) < 0.5) {
          movement += random(-200, 200);
        } else {
          rotation += random(-TWO_PI, TWO_PI);
        }
      }
    }
    if (action == "Collision" || action == "CollisionR") {
      if (infoOut.size() == 0) {
        action = "Searching";
      }
    }
    if (action == "InfoOut" && infoOut.size() == 0) {
      movement = -100;
      startBots();
    }
  }


  void updateInfoOut() {
    if (infoOut.size() > 0) {    
      if (infoOut.get(0).framesLeft > 0) { // Count down
        infoOut.get(0).framesLeft--;
      } else {
        if (infoOut.get(0).bit) { // When it hits 0 and updates, send a tap and remove it to move onto the next one
          sendTap();
          if (infoOut.size() > 0) {
            infoOut.remove(0);
          }
        } else {
          if (action == "Collision" || action == "CollisionR") {
            rotation += TWO_PI / 10;
          }
          infoOut.remove(0);
        }
      }
    }
  }


  void updateInfoIn() {
    if (action == "InfoIn") { 
      if (infoIn.size() > 0) {
        if (infoIn.get(infoIn.size() - 1).framesLeft < tapWait) { // Count to 10, if updates when at 10 then add a 0 and reset.
          infoIn.get(infoIn.size() - 1).framesLeft++;
        } else if (infoIn.size() < infoFinalSize) {
          infoIn.add(new info(false, 0));
        }
      }
      if (infoIn.size() == infoFinalSize) {
        infoFinal = infoIn;
        movement = -100;
        startBots();
      }
    }
    if (action == "Collision") { 
      if (infoIn.size() > 0) {
        if (infoIn.get(infoIn.size() - 1).framesLeft < tapWait) { // Count to 10, if updates when at 10 then add a 0 and reset.
          infoIn.get(infoIn.size() - 1).framesLeft++;
        } else if (infoIn.size() < infoFinalSize) {
          collideResponse();
        }
      }
    }
  }


  void stop() {
    infoIn = new ArrayList<info>();
    infoOut = new ArrayList<info>();
    rotation = 0;
    movement = 0;
    action = "Idle";
  }


  void start() {
    infoIn = new ArrayList<info>();
    infoOut = new ArrayList<info>();
    action = "Searching";
  }


  //----------------------------------------------------------------------------- 


  void sendTap() {
    globalTap(new PVector(pos.x + (cos(direction - PI / 10) * (size / 2 + 15)), pos.y + (sin(direction - PI / 19) * (size / 2 + 15))));
  }


  void receiveTap() {
    if (action == "InfoIn" || action == "Collision") { // Add tap to data
      infoIn.add(new info(true, -1));
    } else if (action == "CollisionR") {
      if (infoIn.size() == 2 && infoFinal.size() == 0) {
        action = "InfoIn";
        infoOut = new ArrayList<info>();
      } else if (infoIn.size() == 1 && infoFinal.size() > 0) {
        action = "InfoOut";
        infoOut = new ArrayList<info>();
        for (int i = 0; i < infoFinal.size(); i++) {
          infoOut.add(infoFinal.get(i));
        }
      } else {
        movement = -100;
        startBots();
      }
      infoIn = new ArrayList<info>(); // Response received
      print("\nT");
    }
  }


  //----------------------------------------------------------------------------- 


  void movement() {
    if (movement != 0) {
      float mult = (movement / abs(movement)) * (movementSpeed / 60);

      pos.add(new PVector(cos(direction), sin(direction)).mult(mult));
      adjustPos = new PVector(0, 0);
      movement -= mult;

      if (abs(movement) < (movementSpeed / 60)) {
        pos.add(new PVector(cos(direction), sin(direction)).mult((movementSpeed / 60)));
        movement = 0;
      }
    }

    if (rotation != 0) {
      float mult = rotation / abs(rotation) * (TWO_PI / 60);

      direction += mult;
      rotation -= mult;

      if (abs(rotation) < (TWO_PI / 60)) {
        direction += rotation;
        rotation = 0;
      }
    }
  }


  void collision() {
    for (int i = 0; i < bots.size(); i++) {
      bot oB = bots.get(i);
      if (bots.get(i) != this) {
        float d = dist(pos.x, pos.y, oB.pos.x, oB.pos.y);
        if (d < size / 2 + oB.size / 2) {
          PVector dir = oB.pos.copy().sub(pos).normalize().mult(d - size / 2 - oB.size / 2);
          adjustPos = dir;
          movement = 0;
          action = "Collision";
          collide();
          collision = true;
        }
      }
    }
    if (pos.x - size / 2 < 0) {
      adjustPos.add(new PVector(size / 2, 0));
    }
    if (pos.x + size / 2 > width) {
      adjustPos.add(new PVector(-size / 2, 0));
    }
    if (pos.y - size / 2 < 0) {
      adjustPos.add(new PVector(0, size / 2));
    }
    if (pos.y + size / 2 > height) {
      adjustPos.add(new PVector(0, -size / 2));
    }
  }


  void collisionCorrection() {
    pos.add(adjustPos);
    adjustPos = new PVector(0, 0);
  }


  void show() {
    stroke(0);
    fill(100);
    ellipse(pos.x, pos.y, size, size);

    line(pos.x, pos.y, pos.x + cos(direction) * size / 2, pos.y + sin(direction) * size / 2);
    line(pos.x, pos.y, pos.x + (cos(direction - PI / 10) * (size / 2 + 15)), pos.y + (sin(direction - PI / 19) * (size / 2 + 15)));

    text(action, pos.x, pos.y + 30);
    for (int i = 0; i < infoFinal.size(); i++) {
      text(infoFinal.get(i).bit ? 1 : 0, pos.x + i * 8, pos.y + 50);
    }
    for (int i = 0; i < infoIn.size(); i++) {
      text(infoIn.get(i).bit ? 1 : 0, pos.x + i * 8, pos.y + 70);
    }
  }
}


//----------------------------------------------------------------------------- 



class info {


  boolean bit;
  int framesLeft;


  info(boolean bit_, int framesLeft_) {
    bit = bit_;
    framesLeft = framesLeft_;
  }
}
