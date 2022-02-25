

void setup() {
  size(600, 600, P3D);
}


void draw() {
  background(0);
  translate(0 + width/2,  width/2, -1000 + width/2);
  rotateY(map(mouseX, 0, width, -PI/3, PI/3));
  rotateX(map(mouseY, 0, height, PI/3, -PI/3) + PI/2);
  translate(-width/2, -width/2, -width/2);

  float amn = 20;
  float dif = width/amn;
  for (int x = 0; x < amn; x++) {
    for (int y = 0; y < amn; y++) {
      for (int z = 0; z < amn; z++) {
        float nz = noise(x * 0.1, y * 0.1, z * 0.1 + frameCount * 0.03);

        if (nz > 0.5) {
          pushMatrix();
          translate((x + 0.5) * dif, (y + 0.5) * dif, (z + 0.5) * dif);
          box(dif, dif, dif);
          popMatrix();
        }
      }
    }
  }
}
