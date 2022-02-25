
PShape can;
float angle;
PShader colorShader;

void setup() {
  size(640, 360, P3D);
  can = createCan(100, 200, 32);
  colorShader = loadShader("ColorFrag.glsl", "ColorVert.glsl");
}

void draw() {
  background(0);
  shader(colorShader);
  translate(width * 0.5, height * 0.5);
  rotateY(angle);
  shape(can);
  angle += 0.01;
}

PShape createCan(float r, float h, int detail) {
  textureMode(NORMAL);
  PShape sh = createShape();
  sh.beginShape(QUAD_STRIP);
  sh.fill(255, 255, 0);
  sh.noStroke();
  for (int i = 0; i <= detail; i++) {
    float angle = TWO_PI / detail;
    float x = sin(i * angle);
    float z = cos(i * angle);
    float u = float(i) / detail;
    sh.normal(x, 0, z);
    sh.vertex(x * r, -h * 0.5, z * r, u, 0);
    sh.vertex(x * r, +h * 0.5, z * r, u, 1);
  }
  sh.endShape();
  return sh;
}
