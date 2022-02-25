String lastCode = "";

void setup() {
  size(400, 400);
  textAlign(CENTER);
  textSize(50);
  noStroke();
  fill(255);
}

void draw() {
  background(50);
  text(lastCode, 200, 215);
}

void keyPressed() {
  lastCode = ""+keyCode;
}
