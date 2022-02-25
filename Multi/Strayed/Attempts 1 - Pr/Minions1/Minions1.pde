
// #region - Setup

PImage glowImage;
ArrayList<Glow> glows;


void preload() {
  // glowImage = loadImage("glow.png");
}


void setup() {
  size(800, 800);
  glows = new ArrayList<Glow>();
}

// #endregion


// #region - Main

void draw() {
  background(0);

  // Update position
  float px = width * 0.5 + 100 * cos(TWO_PI * frameCount / 120);
  float py = height * 0.5 + 100 * sin(TWO_PI * frameCount / 120);
  glows.add(new Glow(new PVector(px, py), 80));
  glows.add(new Glow(new PVector(width * 0.5, height * 0.5), 80));

  // Method 1 - Pixel based updating
  if (true) {

    // Show glows
    loadPixels();
    for (int x = 0; x < width; x++) {
      for (int y = 0; y < height; y++) {

        // Get glow alpha
        float glowAlpha = 0;
        for (Glow glow : glows) {
          glowAlpha += pow(max(1 - dist(glow.pos.x, glow.pos.y, x, y) / glow.radius, 0), 2);
        }

        // Change pixel
        int index = (y * width + x);
        pixels[index] = color(
          red(pixels[index]) + 255 * glowAlpha,
          green(pixels[index]) + 255 * glowAlpha,
          blue(pixels[index]) + 255 * glowAlpha
        );
      }
    }
    updatePixels();
    glows.clear();

  // Method 2 - Image
  } else {
    for (Glow glow : glows) {
      image(glowImage,
        glow.pos.x, glow.pos.y,
        glow.radius * 2, glow.radius * 2);
    }
  }

  // Show body
  noStroke();
  fill(#d245e3);
  ellipse(px, py, 50, 50);
}

// #endregion


class Glow {

  PVector pos;
  float radius;


  Glow(PVector pos_, float radius_) {
    pos = pos_;
    radius = radius_;
  }
}
