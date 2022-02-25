
// #region - Setup

// Declare variables
OpenSimplexNoise oNoise;
boolean run;
int count;
float size;
float[][] field;


void setup() {
  size(800, 800);

  // Initialize variables
  oNoise = new OpenSimplexNoise();
  run = true;
  count = 0;
  size = 10;
  field = new float[1 + ceil(width / size)][1 + ceil(height / size)];
}

// #endregion


// #region - Main

void draw() {
  background(0);

  // Randomize field
  if (run) {
    count++;
    for (int x = 0; x < field.length; x++) {
      for (int y = 0; y < field[x].length; y++) {
        field[x][y] = (float)oNoise.eval(3 * (float)x / field.length, 3 * (float)y / field[x].length, count * 0.01);
      }
    }
  }

  // Draw field
  noStroke();
  for (int x = 0; x < field.length; x++) {
    for (int y = 0; y < field[x].length; y++) {
      fill(field[x][y] * 255);
      rect(x * size, y * size, size, size);
    }
  }

  // Draw squares
  stroke(255);
  strokeWeight(4);
  for (int x = 0; x < field.length; x++) {
    for (int y = 0; y < field[x].length; y++) {
      if (x < field.length - 1 && y < field[x].length - 1) {
        int num = (cLim(field[x][y]) * 1) + (cLim(field[x + 1][y]) * 2) + (cLim(field[x + 1][y + 1]) * 4) + (cLim(field[x][y + 1]) * 8);
        PVector a = new PVector((x + 0.5) * size, (y + 0.0) * size);
        PVector b = new PVector((x + 1.0) * size, (y + 0.5) * size);
        PVector c = new PVector((x + 0.5) * size, (y + 1.0) * size);
        PVector d = new PVector((x + 0.0) * size, (y + 0.5) * size);
        switch (num) {
          case 0: break;                          // 0 0 0 0
          case 1: line(a, d); break;              // 1 0 0 0
          case 2: line(a, b); break;              // 0 1 0 0
          case 3: line(b, d); break;              // 1 1 0 0
          case 4: line(b, c); break;              // 0 0 1 0
          case 5: line(a, b); line(c, d); break;  // 1 0 1 0
          case 6: line(a, c); break;              // 0 1 1 0
          case 7: line(c, d); break;              // 1 1 1 0
          case 8: line(c, d); break;              // 0 0 0 1
          case 9: line(a, c); break;              // 1 0 0 1
          case 10: line(a, d); line(b, c); break; // 0 1 0 1
          case 11: line(b, c); break;             // 1 1 0 1
          case 12: line(b, d); break;             // 0 0 1 1
          case 13: line(a, b); break;             // 1 0 1 1
          case 14: line(a, d); break;             // 0 1 1 1
          case 15: break;                         // 1 1 1 1
        }
      }
    }
  }
}


void line(PVector a, PVector b) {
  // Draw line between vectors
  line(a.x, a.y, b.x, b.y);
}


void keyPressed() {
  // Toggle run
  if (keyCode == 32) run = !run;
}


int cLim(float val) {
  // Custom limiter
  return val < 0.15 ? 0 : 1;
}

// #endregion
