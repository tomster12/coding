
// Declare variables
AutomataSim sim;


void setup() {
  // Processing setup
  size(900, 900);
  noSmooth();
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);

  // Init variables
  sim = new AutomataSim(
    new int[][] {
      new int[] {3, 3},
      new int[] {2, 3} },
    new PVector(800, 800),
    new PVector(50, 50),
    new PVector(800, 800)
  );
}


void draw() {
  background(0);

  // Update and show sim
  sim.update();
  sim.show();

  // Draw UI
  text("Updating: " + sim.isUpdating, width * 0.5, 25);
}


void keyPressed() {
  // key - Toggle isUpdating
  if (keyCode == 9) sim.isUpdating = !sim.isUpdating;
}
