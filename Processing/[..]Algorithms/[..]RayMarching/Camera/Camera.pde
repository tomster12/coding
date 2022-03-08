

player pl;
ArrayList<object> objects;
float camRange = PI / 2;
int camAmount = 50;
int camDistance = 400;


void setup() {
  size(1000, 1000);
  pl = new player(new PVector(200, 200));

  objects = new ArrayList<object>();
  for (int i = 0; i < 20; i++) {
    objects.add(new object(new PVector(random(width), random(height)), new PVector(random(50, 200), random(50, 200)), color(200, 200, 100)));
  }

  objects.add(new object(new PVector(0, 0), new PVector(1000, 10), color(50, 0, 100)));
  objects.add(new object(new PVector(0, 10), new PVector(10, 980), color(50, 0, 100)));
  objects.add(new object(new PVector(990, 10), new PVector(10, 980), color(50, 0, 100)));
  objects.add(new object(new PVector(0, 990), new PVector(1000, 10), color(50, 0, 100)));
}


void draw() {
  background(200);

  pl.update();
  pl.show();
  for (int i = 0; i < objects.size(); i++) {
    objects.get(i).show();
  }

  drawCamera(pl.camOut);
}


void keyPressed() {
  if (pl.action == null) {
    if (keyCode == 37) {
      pl.action = "rl";
    }
    if (keyCode == 38) {
      pl.action = "f";
    }
    if (keyCode == 39) {
      pl.action = "rr";
    }
    if (keyCode == 40) {
      pl.action = "b";
    }
    if (keyCode == 81) {
      pl.action = "sl";
    }
    if (keyCode == 87) {
      pl.action = "sr";
    }
  }
}


void keyReleased() {
  pl.action = null;
}


void drawCamera(color[] cols) {
  for (int i = 0; i < cols.length; i++) {
    fill(cols[i]);
    rect(50 + i * (900 / camAmount), 700, (900 / camAmount), 200);
  }
}
