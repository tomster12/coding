
// #region - Setup

int amount;
float[] values;


void setup() {
  size(800, 800);
  amount = 1;
  updateValues();
}

// #endregion


// #region - Main

void draw() {
  background(213, 189, 103);
  showGraph();
}


void showGraph() {
  // Axis
  stroke(51, 43, 43);
  strokeWeight(2);
  PVector pos = new PVector(100, 700);
  PVector size = new PVector(600, 600);
  line(pos.x, pos.y, pos.x, pos.y-size.y);
  line(pos.x, pos.y, pos.x+size.x, pos.y);

  // Line point to point
  stroke(0);
  strokeWeight(2);
  float xDif = size.x/(amount-1);
  float yDif = -size.y/3;
  for (int i = 0; i < amount-1; i++) {
    line(
      pos.x + i*xDif,
      pos.y + values[i]*yDif,
      pos.x + (i+1)*xDif,
      pos.y + values[i+1]*yDif
    );
  }

  if (amount > 1) {
    textSize(30);
    textAlign(CENTER);

    // Percentage change
    text(
      "+" + nf(100.0/(amount-1.0),1,2) + "% every",
      pos.x + size.x/2.0,
      pos.y - size.y/10.0 - 100
    );
    String st = "1/" + (amount-1);
    if (amount == 2) {
      st = "1";
    }

    // Year change
    text(
      st+" Year",
      pos.x + size.x/2.0,
      pos.y - size.y/10.0 - 60
    );

    // Result
    text(
      "Results in £" + nf(values[values.length - 1],1,4),
      pos.x + size.x/2.0,
      pos.y - size.y/10.0 - 20
    );
  }

  // Price text
  fill(222, 222, 222);
  textSize(20);
  textAlign(RIGHT);
  for (int i = 0; i < 3; i++) {
    float pX = pos.x - 25;
    float pY = pos.y - (i+1)*size.y/3.0;
    text("£"+(i+1), pX - 5, pY + 6.6);
    line(pX, pY, pX + 25, pY);
  }

  // Highest text
  if (amount > 2) {
    float pX = pos.x - 25;
    float pY = pos.y - values[values.length-1]*size.y/3.0;
    text("£"+nf(values[values.length-1],1,2), pX - 5, pY + 6.6);
    line(pX, pY, pX + 25, pY);
  }

  // Line from point to y-axis
  stroke(80);
  strokeWeight(1);
  for (int i = 0; i < amount-1; i++) {
    line(
      pos.x + (i+1)*xDif,
      pos.y + values[i+1]*yDif,
      pos.x,
      pos.y + values[i+1]*yDif
    );
  }
}


void updateValues() {
  values = new float[amount];
  float increase = 1.0/(amount-1);
  values[0] = 1;
  for (int i = 1; i < amount; i++) {
    values[i] = values[i-1] * (1+increase);
  }
}

// #endregion


// #region - Input

void keyPressed() {
  if (keyCode == 38) {
    amount = amount+1;
  } else if (keyCode == 40) {
    amount = amount>1?amount-1:amount;
  }
  updateValues();
}

// #endregion
