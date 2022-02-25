
PShader shd;


void setup() {
  size(800, 800, P2D);
  noStroke();

  // Initial shader load
  shd = loadShader("noise.frag");
}


void draw() {
  if (shd != null) {
    try {

      // Set uniforms
      shd.set("u_resolution", float(width), float(height));
      shd.set("u_mouse", float(mouseX), float(height - mouseY));
      shd.set("u_time", millis() / 1000.0);

      // Set shader and draw
      shader(shd);
      rect(0, 0, width, height);

    } catch (Exception e) {}
  }
}


void keyPressed() {
  // Reload shader
  shd = loadShader("noise.frag");
}
