
float x, t, y, range;


void setup() {
  size(600, 600);
  noStroke();
  fill(255);

  x = width * 0.5; t = 0; y = height * 0.4;
  range = width * 0.4;
}


void draw() {
  background(0);

  // x0 = centre + function(time)
  x -= range * -sin(7*PI*t)/(7*PI*t-PI);
  t = min(1, t+0.01);
  x += range * -sin(7*PI*t)/(7*PI*t-PI);
  ellipse(x, y, 10, 10);
}
