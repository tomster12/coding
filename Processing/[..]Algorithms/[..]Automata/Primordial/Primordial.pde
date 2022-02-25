
// Declare variables
PrimordialSim sim;


void setup() {
  // Processing setup
  size(900, 900);
  noSmooth();
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);

  // Init variables
  sim = new PrimordialSim(
    new PVector(2500, 2500), 1,
    50, 180, 17, 6.7,
    new PVector(0, 0), new PVector(900, 900)
  );
}


void draw() {
  background(color(189, 0, 255));

  // Update and show sim
  sim.update();
  sim.show();
}