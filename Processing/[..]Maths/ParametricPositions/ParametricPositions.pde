
boolean running;
float t, dt;
float ax,ay,bx,by;
float scale;

ArrayList<PVector> aPath;
ArrayList<PVector> bPath;


void setup() { // Setup variables and canvas
  size(600, 600);
  textSize(20);
  textAlign(CENTER);

  running = false;
  t = 0;
  dt = PI * 1/60;
  scale = 40;

  aPath = new ArrayList<PVector>();
  bPath = new ArrayList<PVector>();
}


void draw() {
  background(141, 198, 93);

  pushMatrix(); // Draw the points in centre of screen
  translate(width/2, height/2);
  scale(scale, scale);

  ax = -cos(t-PI/2); // Set the variables
  ay = sin(2*t);
  bx = -sin(2*t);
  by = cos(t-PI/2);
  if (running) t += dt;

  stroke(240);
  strokeWeight(3 / scale);
  noFill();
  point(ax, ay); // Draw points
  point(bx, by);

  aPath.add(new PVector(ax, ay)); // Draw paths
  bPath.add(new PVector(bx, by));
  if (aPath.size() > 20) aPath.remove(0);
  if (bPath.size() > 20) bPath.remove(0);
  beginShape();
  for (PVector p : aPath)
    vertex(p.x, p.y);
  endShape();
  beginShape();
  for (PVector p : bPath)
    vertex(p.x, p.y);
  endShape();
  popMatrix();

  noStroke(); // Show the text at top of screen
  fill(50);
  text("t: " + nf2(t, 2), width/2, 30);
  text("dt: " + dt, width/2, 60);
}


String nf2(float s, int rMax) { // Custom formatting
  int lMax = floor(log(s) / log(10));
  return nf(s, lMax, rMax);
}


void keyPressed() {
  switch (keyCode) { // Start/stop simulation
    case 9: running=!running;
      break;

    case 81: t=0; // Set time back to 0
      break;
  }
}
