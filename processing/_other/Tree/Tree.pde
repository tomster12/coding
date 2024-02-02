

PVector startPos = new PVector(300, 300);
float startSize = 65;
float startAngle = -PI / 2;
float changeSize = 0.7;
float changeAngle = PI / 10;
int maxIteration = 10;
float[] waveLimit = new float[] {-0.3, 0.3};
float waveSpeed = 0.005;


void setup() {
  size(600, 600);
}


void draw() {
  background(200);

  stroke(100, 200, 100);
  noFill();
  dTree(startPos, startAngle, startSize, 0);

  noStroke();
  fill(0);
  text(startSize, 0, 10);
  text(changeSize, 0, 20);
  text(changeAngle, 0, 30);
  text(waveLimit[0] + " : " + waveLimit[1], 0, 40);
  text(waveSpeed, 0, 50);
}


void keyPressed() {
  switch (keyCode) {
  case 65:
    startSize += 1;
    break;
  case 90:
    startSize -= 1;
    break;

  case 83:
    changeSize += 0.05;
    break;
  case 88:
    changeSize -= 0.05;
    break;

  case 68:
    changeAngle += 0.005;
    break;
  case 67:
    changeAngle -= 0.005;
    break;

  case 70:
    waveLimit[0]-=0.001;
    waveLimit[1]+=0.001;
    break;
  case 86:
    waveLimit[0]+=0.001;
    waveLimit[1]-=0.001;
    break;

  case 71:
    waveSpeed += 0.001;
    break;
  case 66:
    waveSpeed -= 0.001;
    break;
  }
  if (keyCode == 37) {
    changeAngle += PI / 400;
  }
  if (keyCode == 39) {
    changeAngle -= PI / 400;
  }


  if (keyCode == 38) {
    changeSize += 0.05;
  }
  if (keyCode == 40) {
    changeSize -= 0.05;
  }
}


void dTree(PVector pos, float angle, float size, int counter) {
  float localWave1 = map(noise(frameCount * waveSpeed, counter * 1000), 0, 1, waveLimit[0], waveLimit[1]);
  float localWave2 = map(noise(frameCount * waveSpeed, counter * 1000 + 500), 0, 1, waveLimit[0], waveLimit[1]);

  float a1 = angle - changeAngle + localWave1;
  PVector ep1 = new PVector(pos.x + cos(a1)*size, pos.y + sin(a1)*size);

  float a2 = angle + changeAngle + localWave2;
  PVector ep2 = new PVector(pos.x + cos(a2)*size, pos.y + sin(a2)*size);

  stroke(
    map(counter, 0, maxIteration-1, 100, 0),
    map(counter, 0, maxIteration-1, 200, 100),
    map(counter, 0, maxIteration-1, 100, 0)
    );
  line(pos.x, pos.y, ep1.x, ep1.y);
  line(pos.x, pos.y, ep2.x, ep2.y);

  if (counter + 1 < maxIteration) {
    dTree(ep1, a1, size * changeSize, counter + 1);
    dTree(ep2, a2, size * changeSize, counter + 1);
  }
}
