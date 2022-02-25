
// #region - Setup

// Declare variables
import ddf.minim.*;
Minim minim;
AudioPlayer audioIn;
int bufferSize;


void setup() {
  // Setup processing
  size(1000, 1000);
  stroke(#42ff00);
  fill(255);

  // Setup variables
  minim = new Minim(this);
  audioIn = minim.loadFile("noise1.mp3", 2048);
  bufferSize = audioIn.bufferSize();

  // Start the audio
  audioIn.play();
}

// #endregion


// #region - Main

void draw() {
  background(0);

  // Get an array of points
  PVector[] lr = new PVector[bufferSize];
  for (int i = 0; i < bufferSize; i++) {
    float pX = audioIn.left.get(i);
    float pY = audioIn.right.get(i);
    lr[i] = new PVector(pX, pY);
  }


  // Draw LR Seperate
  for (int i = 0; i < bufferSize - 1; i++) {
    PVector sample0 = lr[i];
    PVector sample1 = lr[i + 1];
    float p0x = map(i, 0, bufferSize, w(0.1), w(0.9));
    float p1x = map(i + 1, 0, bufferSize, w(0.1), w(0.9));

    // Draw left
    float p0ly = map(sample0.x, -1, 1, h(0.025), h(0.325));
    float p1ly = map(sample1.x, -1, 1, h(0.025), h(0.325));
    line(p0x, p0ly, p1x, p1ly);

    // Draw right
    float p0ry = map(sample0.y, -1, 1, h(0.35), h(0.65));
    float p1ry = map(sample1.y, -1, 1, h(0.35), h(0.65));
    line(p0x, p0ry, p1x, p1ry);
  }


  // Draw player position indicator
  line(w(0.1), h(0.3375), w(0.9), h(0.3375));
  float plx = map(audioIn.position(), 0, audioIn.length(), w(0.1), w(0.9));
  line(plx, h(0.325), plx, h(0.35));


  // Draw LR Together
  for (int i = 0; i < bufferSize; i++) {
    PVector sample = lr[i];
    float px = map(sample.x, -1, 1, w(0.35), w(0.65));
    float py = map(sample.y, -1, 1, h(0.675), h(0.975));
    point(px, py);
  }
}


float w(float val) {
  // Clean width function
  return width * val;
}


float h(float val) {
  // Clean width function
  return height * val;
}

// #endregion
