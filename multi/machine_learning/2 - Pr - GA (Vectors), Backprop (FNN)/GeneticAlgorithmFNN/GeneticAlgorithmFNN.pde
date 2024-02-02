

PVector spawnPos;
PVector spawnRange;
PVector startPos;

int dataSize;
int dataRange;

PVector target;
float targetSize;
float unitSize;

float mutationRate;

int genAlSize;
geneticAlgorithm genAl;
unitData bestUnitData;

float[] toGraph1;
float[] toGraph2;


//------------------------------------------------------------


void setup() {
  size(800, 800);

  spawnPos = new PVector(100, 100);
  spawnRange = new PVector(600, 600);
  startPos = new PVector(200, 600);

  dataSize = 200;
  dataRange = 5;

  target = new PVector(400, 50);
  targetSize = 50;
  unitSize = 30;

  mutationRate = 0.05;

  genAlSize = 400;
  genAl = new geneticAlgorithm(genAlSize);
}


//------------------------------------------------------------


void draw() {
  background(200);

  genAl.update();

  fill(150);
  stroke(100);
  ellipse(target.x, target.y, targetSize, targetSize);

  print("\n");
  if (toGraph1 != null) {
    float xScale = 1;
    for (int i = 0; i < toGraph1.length; i++) {
      stroke(0);
      float sx = 50;
      float sy = 250;
      line(sx + (i * xScale), sy, sx + (i * xScale), sy + (toGraph1[i] * 20));
    }
  }

  if (toGraph2 != null) {
    float xScale = 1;
    for (int i = 0; i < toGraph2.length; i++) {
      stroke(0);
      float sx = 250;
      float sy = 50;
      if (i < toGraph2.length / 2) {
        stroke(200, 100, 100);
      }
      line(sx + (i * xScale), sy, sx + (i * xScale), sy + (toGraph2[i] * 50));
    }
  }

  if (genAl.unitDatas != null) {
    if (genAl.unitDatas.size() > 0) {
      DrawNetwork(genAl.unitDatas.get(genAl.unitDatas.size() - 1).data.network, new PVector(50, 50), 30, new PVector(60, 60), new float[] {1, 3}, false);
    }
  }
}


//------------------------------------------------------------


void keyPressed() {
  if (keyCode == 9) {
    genAl.running = true;
  }
  if (keyCode == 81) {
    genAl.quickUpdate();
  }
}


//------------------------------------------------------------
