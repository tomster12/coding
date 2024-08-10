
PShader toon;

void setup() {
  size(640, 360, P3D);
  noStroke();
  fill(204);
  toon = loadShader("ToonFrag.glsl", "ToonVert.glsl");
  toon.set("fraction", 1.0);
}

void draw() {
  shader(toon);
  background(0);
  float dirX = map(mouseX, 0, width, -1, 1);
  float dirY = map(mouseY, 0, height, -1, 1);
  directionalLight(204, 204, 204, -dirX, -dirY, -1);
  translate(width/2, height/2);
  sphere(120);
}
