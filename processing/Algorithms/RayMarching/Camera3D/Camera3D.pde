

PVector camSize;
float camDistance;
float camRangeLR;
float camRangeUD;
int camCheckAmount;

PVector dCamPos;
PVector dCamSize;
PImage camImage;

camera cam;
ArrayList<object> objects;




void setup() {
  size(800, 800);

  setupVariables();
  setupObjects();
}


void setupVariables() {
  camSize = new PVector(100, 100);
  camDistance = 400;
  camRangeLR = PI / 2;
  camRangeUD = PI / 2;
  camCheckAmount = 50;

  dCamPos = new PVector(200, 350);
  dCamSize = new PVector(400, 400);
  camImage = new PImage((int)camSize.x, (int)camSize.y);

  cam = new camera(new PVector(300, 300, 10));
  objects = new ArrayList<object>();
}


void setupObjects() {
  for (int i = 0; i < 5; i++) {
    objects.add(new object(new PVector(50 + i * 80, 50, 0), new PVector(50, 50, 200 - i * 20)));
  }
}




void draw() {
  background(0);

  draw2D();
  cam.camUpdate();
  draw3D();
}




void draw2D() {
  for (int i = 0; i < objects.size(); i++) {
    objects.get(i).show();
  }
  cam.show();
}


void draw3D() {
  noStroke();
  fill(220);

  camImage.loadPixels();
  for (int x = 0; x < camSize.x; x++) {
    for (int y = 0; y < camSize.y; y++) {
      camImage.pixels[x + camImage.width * y] = cam.camOut[x][y];
    }
  }
  camImage.updatePixels();

  image(camImage, dCamPos.x, dCamPos.y, dCamSize.x, dCamSize.y);
}



void keyPressed() {
  cam.kp(keyCode);
}
