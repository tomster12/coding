

float updatesPerFrame;

ArrayList<gravitySource> gravitySources;
ArrayList<object> objects;
creation currentCreation;
int creationType;
boolean showTrails;
boolean showDirection;
boolean showTotalKE;
boolean showCoM;
float forceMultiplier;
float[] gravityLimits;

boolean collision;
boolean attractToGravity;
boolean attractToOther;




void setup() {
  size(1000, 1000);

  updatesPerFrame = 1;

  gravitySources = new ArrayList<gravitySource>();
  objects = new ArrayList<object>();
  currentCreation = null;
  creationType = 1;
  showTrails = false;
  showDirection = false;
  showTotalKE = true;
  showCoM = true;
  forceMultiplier = 1;
  gravityLimits = new float[] {25, 1000};

  collision = true;
  attractToGravity = true;
  attractToOther = true;

  premadeSetup(2);
  // 0 - Gravity Circle 1
  // 1 - 8 Balls gravity spiral
  // 2 - 2 Balls collision
  // 3 - Gravity Circle 2
}




void draw() {
  background(30, 30, 35);

  if (currentCreation != null) {
    currentCreation.update();
  }

  for (int i = 0; i < objects.size(); i++) {
    objects.get(i).gravity();
  }

  for (int update = 0; update < updatesPerFrame; update++) {
    for (int i = 0; i < objects.size(); i++) {
      objects.get(i).movement();
    }
    if (collision) {
      for (int i = 0; i < objects.size(); i++) {
        objects.get(i).collisions();
      }
      for (int i = 0; i < objects.size(); i++) {
        objects.get(i).collisionCorrection();
      }
    }
  }

  if (showTotalKE) {
    float sum = 0;
    for (int i = 0; i < objects.size(); i++) {
      object obj = objects.get(i);
      sum += 0.5 * obj.mass * obj.vel.mag() * obj.vel.mag();
    }

    fill(255);
    text(sum, 0, 200);
  }

  if (showCoM) {
    PVector adjPosTot = new PVector(0, 0);
    float mTot = 0;
    for (int i = 0; i < objects.size(); i++) {
      adjPosTot.add(objects.get(i).pos.copy().mult(objects.get(i).mass));
      mTot += objects.get(i).mass;
    }
    PVector CoM = adjPosTot.mult(1 / mTot);
    fill(200, 100, 200);
    ellipse(CoM.x, CoM.y, 10, 10);
  }

  for (int i = 0; i < gravitySources.size(); i++) {
    gravitySources.get(i).show();
  }

  for (int i = 0; i < objects.size(); i++) {
    objects.get(i).show();
  }
}




void mousePressed() {
  currentCreation = new creation();
}


void mouseReleased() {
  currentCreation.release();
  currentCreation = null;
}




void keyPressed() {
  if (keyCode == 9) {
    creationType = abs(creationType - 1);
  }
  if (keyCode == 81) {
    showTrails = !showTrails;
  }
  if (keyCode == 87) {
    showDirection = !showDirection;
  }
}




void premadeSetup(int type) {
  switch(type) {
  case 0:
    collision = false;
    attractToGravity = true;
    attractToOther = false;

    gravitySources.add(new gravitySource(new PVector(width * 0.25, height * 0.25), 50));
    gravitySources.add(new gravitySource(new PVector(width * 0.75, height * .75), 50));
    int amount = 20;
    for (int i = 0; i < amount; i++) {
      float angle = 360 * i / amount;
      float pX = width * 0.5 + cos(angle) * width / 8;
      float pY = height * 0.5 + sin(angle) * width / 8;
      objects.add(new object(new PVector(pX, pY), 10));
    }
    break;


  case 1:
    collision = false;
    attractToGravity = false;
    attractToOther = true;
    forceMultiplier = 0.2;

    objects.add(new object(
      new PVector(width * 0.3, height * 0.5),
      20,
      new PVector(0, 3 / updatesPerFrame)
      ));

    objects.add(new object(
      new PVector(width * 0.7, height * 0.5),
      20,
      new PVector(0, -3 / updatesPerFrame)
      ));

    objects.add(new object(
      new PVector(width * 0.5, height * 0.3),
      20,
      new PVector(-3 / updatesPerFrame, 0)
      ));

    objects.add(new object(
      new PVector(width * 0.5, height * 0.7),
      20,
      new PVector(3 / updatesPerFrame, 0)
      ));

    objects.add(new object(new PVector(width * 0.25, height * 0.25), 10));
    objects.add(new object(new PVector(width * 0.75, height * 0.25), 10));
    objects.add(new object(new PVector(width * 0.25, height * 0.75), 10));
    objects.add(new object(new PVector(width * 0.75, height * 0.75), 10));
    break;


  case 2:
    collision = true;
    attractToGravity = false;
    attractToOther = false;

    objects.add(new object(new PVector(width * 0.49, height * 0.25),
      30,
      new PVector(0, 3 / updatesPerFrame)
      ));

    objects.add(new object(new PVector(width * 0.49, height * 0.75),
      30,
      new PVector(0, -3 / updatesPerFrame)
      ));

    objects.add(new object(new PVector(width * 0.5, height * 0.5),
      30));
    break;

  case 3:
    collision = false;
    attractToGravity = true;
    attractToOther = false;
    gravityLimits = new float[] {300, 500};
    gravitySources.add(new gravitySource(new PVector(width * 0.5, height * 0.25), 70));
    gravitySources.add(new gravitySource(new PVector(width * 0.25, height * 0.75), 50));
    gravitySources.add(new gravitySource(new PVector(width * 0.75, height * 0.75), 50));
    gravitySources.add(new gravitySource(new PVector(width * 0.5, height * 0.8), 20));
    gravitySources.add(new gravitySource(new PVector(width * 0.35, height * 0.4), 25));
    gravitySources.add(new gravitySource(new PVector(width * 0.65, height * 0.4), 25));
    int aWidth = 100;
    int aHeight = 100;
    float xSpacing = width / (aWidth+1);
    float ySpacing = width / (aHeight+1);
    for (float x = xSpacing; x < width; x += xSpacing) {
      for (float y = ySpacing; y < height; y += ySpacing) {
        objects.add(new object(new PVector(x, y), 1));
      }
    }
    break;
  }
}
