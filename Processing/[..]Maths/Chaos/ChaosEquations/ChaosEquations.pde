
// https://www.youtube.com/watch?v=fDSIRXmnVvk

float t;
float dt;
float iterCount;
float amount;
float scale;


void setup() {
  size(800, 800);
  rectMode(CENTER);
  textAlign(RIGHT);
  background(0);
  setupVariables();
}


void setupVariables() {
  t = -0.6;
  dt = 0.001;
  iterCount = 150;
  amount = 150;
  scale = 6;
}


void draw() {
  translate(width/2, height/2);
  scale(width / scale, height / scale);
  fill(0, 20);
  rect(0, 0, width, height);
  stroke(255);
  strokeWeight(0.0001);

  for (int i = 0; i < iterCount; i++) {
    float px = t;
    float py = t;
    for (int o = 0; o < amount; o++) {
      point(px, py);
      float nx = -px*px - t*t + px*t - py*t - px;
      float ny = -px*px + t*t + px*t - px - py;
      // float nx = -py*py - px*t + py;
      // float ny = px*px - px*py + t;
      px = nx;
      py = ny;
    }
    t += dt/iterCount;
  }
}
