
PVector pos;


void setup() {
  size(800, 800);
  pos = new PVector(width/2, height/2);
}

void draw() {
  // background(0);

  stroke(255);
  strokeWeight(4);
  line(pos.x, pos.y, mouseX, mouseY);
}


void mousePressed() {
  pos = new PVector(mouseX, mouseY);
}
