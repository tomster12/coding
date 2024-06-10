

FourierDrawer frDrwr;


void setup() {
  size(600, 600);

  frDrwr = new FourierDrawer(
    0.02, new PVector(150, 300), 100,
    true, new PVector(350, 300), 200
  );
}


void draw() {
  background(0);
  frDrwr.updateFourier();
}
