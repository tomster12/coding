

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
  startPos = new PVector(400, 600);

  dataSize = 250;
  dataRange = 15;
  
  target = new PVector(400, 200);
  targetSize = 15;
  unitSize = 30;
  
  mutationRate = 0.05;
  
  genAlSize = 150;
  genAl = new geneticAlgorithm(genAlSize);
}


  //------------------------------------------------------------


void draw() {
  background(200);
  
  genAl.update();
  
  fill(150);
  stroke(100);
  ellipse(target.x, target.y, targetSize, targetSize);
  
  if (toGraph1 != null) {
    float xScale = (400 / toGraph1.length);
    for (int i = 0; i < toGraph1.length; i++) {
      stroke(0);
      float sx = 50;
      float sy = 50;
      line(sx + (i * xScale), sy, sx + (i * xScale), sy + (toGraph1[i] * 20)); 
    }
  }
  
  if (toGraph2 != null) {
   float xScale = (400 / toGraph2.length);
    for (int i = 0; i < toGraph2.length; i++) {
      stroke(0);
      float sx = 400;
      float sy = 50;
      if (i < toGraph2.length / 2) {
        stroke(200, 100, 100); 
      }
      line(sx + (i * xScale), sy, sx + (i * xScale), sy + (toGraph2[i] * 0.5)); 
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
