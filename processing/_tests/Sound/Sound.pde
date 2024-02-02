 //<>// //<>//

import processing.sound.*;

AudioIn input;
Amplitude amp;

FloatList volumes = new FloatList();
PVector alzPos = new PVector(50, 100);
PVector alzSize = new PVector(400, 600);
float alzSensitivity = 3000;

boolean hitting = false;
boolean hit = false;
float hitSensitivity = 0.0005;
FloatList hits = new FloatList();




// -------------------------------------------------------------


void setup() {
  size(800, 800);

  setupSound();
}


//-----------------------


void setupSound() {
  input = new AudioIn(this, 0);
  input.start();
  amp = new Amplitude(this);
  amp.input(input);
}


// -------------------------------------------------------------


void draw() {
  background(200);

  updateSound();
  drawSound();

  updateHit();
  drawHit();
}


// -------------------------------------------------------------


void updateSound() {
  if (volumes.size() > alzSize.x) {
    volumes.remove(0);
  }
  float vol = amp.analyze();
  volumes.push(vol);
}


//-----------------------


void updateHit() {
  hits.push(0);

  if (volumes.size() > 3) {
    if (volumes.get(volumes.size() - 1) - volumes.get(volumes.size() - 2) > hitSensitivity && !hitting) {
      hitting = true;
      hit();
    } else if (hitting) {
      hitting = false;
    }
  }
}


// -------------------------------------------------------------


void drawSound() {
  stroke(0);
  noFill();
  beginShape();
  for (int i = volumes.size() - 1, x = 0; i >= 0; i--, x++) {
    vertex(alzPos.x + alzSize.x - x, alzPos.y + alzSize.y - constrain(volumes.get(i) * alzSensitivity, 0, alzSize.y));
  }
  endShape();

  for (int i = hits.size() - 1, x = 0; i >= 0; i--, x++) {
    if (hits.get(i) == 1) {
      stroke(0);
      fill(255);
      ellipse(alzPos.x + alzSize.x - x, alzPos.y + alzSize.y + 50, 10, 10);
    }
  }
}


//-----------------------


void drawHit() {
  if (hitting) {
    fill(100, 200, 100);
  } else {
    fill(200, 100, 100);
  }
  ellipse(600, 400, 50, 50);
}


// -------------------------------------------------------------


void hit() {
  print("Hit!");
  hits.set(hits.size() - 1, 1);
}

// -------------------------------------------------------------
