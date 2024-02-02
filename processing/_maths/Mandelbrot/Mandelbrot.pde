
// #region - Setup

// Declare variables
boolean[] inputs;
int quality;
double cx, cy;
double vx, vy;
double scale, vScale;
int iterationMax;


void setup() {
  // Processing functions
  size(900, 900, P2D);
  textSize(25);
  textAlign(CENTER);

  // Initialize variables
  inputs = new boolean[500];
  quality = 2;
  cx = 0;
  cy = 0;
  vx = 0;
  vy = 0;
  scale = 1;
  vScale = 0;
  iterationMax = 10;
}

// #endregion


// #region - Main

void draw() {
  // Input for camera movement
  if (inputs[65])
    vx -= 0.002 * scale;
  if (inputs[87])
    vy -= 0.002 * scale;
  if (inputs[68])
    vx += 0.002 * scale;
  if (inputs[83])
    vy += 0.002 * scale;

  // Smoothed movement
  cx += vx;
  cy += vy;
  vx *= 0.9;
  vy *= 0.9;
  scale += vScale;
  vScale *= 0.9;

  // Loop over every pixel onscreen and map
  loadPixels();
  for (int x = 0; x < width; x += quality) {
    for (int y = 0; y < height; y += quality) {
      double cr = (cx - scale) + ((double)x / width) * (scale * 2);
      double cc = (cy - scale) + ((double)y / height) * (scale * 2);

      // Mandelbrot calculations
      double zr = 0;
      double zc = 0;
      int iteration = 0;
      while ((zr * zr + zc * zc) < 2 * 2 && iteration <= iterationMax) {
        double nzr = (zr * zr - zc * zc) + cr;
        double nzc = (zr * zc + zc * zr) + cc;
        zr = nzr;
        zc = nzc;
        iteration++;
      }

      // Set value based on iterations taken to escape
      double value = (double)iteration / iterationMax;
      for (int dx = 0; dx < quality; dx++) {
        for (int dy = 0; dy < quality; dy++) {
          int ind = (x + dx) + (y + dy) * width;
          pixels[ind] = color((float)value * 255);
        }
      }
    }
  }
  updatePixels();

  // Information text
  fill(200, 100, 0);
  double nx = (cx-scale) + ((float)mouseX / width) * (scale * 2);
  double ny = (cy-scale) + ((float)mouseY / height) * (scale * 2);
  text("Position: " + nx + " + " + ny + "i", width / 2, height - 70);
  text("Quality: " + quality, width / 2, height - 40);
  text("Iteration Max: " + iterationMax, width / 2, height - 10);
}


void keyPressed() {
  // Key been pressed
  inputs[keyCode] = true;
  if (keyCode == 38) iterationMax++;
  if (keyCode == 40) iterationMax--;
  if (keyCode == 37) quality = max(1, quality - 1);
  if (keyCode == 39) quality = min(6, quality + 1);
}


void keyReleased() {
  // Key been released
  inputs[keyCode] = false;
}


void mouseWheel(MouseEvent e) {
  // Camera zoom
  vScale += e.getCount() * scale * 0.01;
}

// #endregion
