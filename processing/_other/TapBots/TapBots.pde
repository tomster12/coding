

ArrayList<bot> bots = new ArrayList<bot>();
int tapWait = 2;

float rotationSpeed = 8 * PI; // 2 PI rotation per 60f
float movementSpeed = 400; // 20u per 60f


boolean collision = false;




void setup() {
  size(800, 800);

  for (int i = 0; i < 5; i++) {
    bots.add(new bot(new PVector(random(width), random(height)), 40));
  }
  bots.get(0).infoFinal = testInfo(new int[] {1, 0, 1, 1, 0, 1, 0, 1});

  textSize(20);
}




ArrayList<info> testInfo(int[] bits) {
  ArrayList<info> fInfo = new ArrayList<info>();
  for (int i = 0; i < bits.length; i++) {
    fInfo.add(new info((bits[i] == 1 ? true : false), tapWait));
  }
  return fInfo;
}




void draw() {
  background(200);

  for (int i = 0; i < bots.size(); i++) {
    bots.get(i).movement();
  }
  for (int i = 0; i < bots.size(); i++) {
    bots.get(i).collision();
  }
  if (collision) {
    stopBots();
    collision = false;
  }
  for (int i = 0; i < bots.size(); i++) {
    bots.get(i).collisionCorrection();
  }

  for (int i = 0; i < bots.size(); i++) {
    bots.get(i).updateInfoOut();
  }
  for (int i = 0; i < bots.size(); i++) {
    bots.get(i).updateInfoIn();
  }

  for (int i = 0; i < bots.size(); i++) {
    bots.get(i).action();
  }

  for (int i = 0; i < bots.size(); i++) {
    bots.get(i).show();
  }

  updateNotifications();
}


void globalTap(PVector pos) {
  addNotification(pos, "Tap", 100);
  for (int i = 0; i < bots.size(); i++) {
    if (dist(pos.x, pos.y, bots.get(i).pos.x, bots.get(i).pos.y) < bots.get(i).size / 2) {
      bots.get(i).receiveTap();
      break;
    }
  }
}


void startBots() {
  for (int i = 0; i < bots.size(); i++) {
    if (bots.get(i).adjustPos.x == 0 && bots.get(i).adjustPos.y == 0) {
      bots.get(i).start();
    }
  }
}


void stopBots() {
  for (int i = 0; i < bots.size(); i++) {
    if (bots.get(i).adjustPos.x == 0 && bots.get(i).adjustPos.y == 0) {
      bots.get(i).stop();
    }
  }
}
