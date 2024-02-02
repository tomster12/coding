
public class PrimordialSim {

  // #region - Setup

  // Declare variables
  PVector worldSize;
  PVector showPos;
  PVector showSize;

  float r, alpha, beta, v;

  PGraphics out;
  ArrayList<Particle> particles;


  PrimordialSim(PVector worldSize_, int n,
    float r_, float alpha_, float beta_, float v_,
    PVector showPos_, PVector showSize_) {

    // Initialize variables
    worldSize = worldSize_;
    showPos = showPos_;
    showSize = showSize_;

    r = r_;
    alpha = alpha_;
    beta = beta_;
    v = v_;

    out = createGraphics((int)worldSize.x, (int)worldSize.y);
    particles = new ArrayList<Particle>();


    // Initialize particles
    for (int i = 0; i < n; i++) {
      particles.add(new Particle(this,
        new PVector(random(worldSize.x), random(worldSize.y)), r * 0.2,
        r, alpha, beta, v
      ));
    }
  }

  // #endregion


  // #region - Main

  void update() {
    // Update all particles
    if (frameCount % 60 == 0) {
      for (Particle p : particles) p.update();
      for (Particle p : particles) p.lateUpdate();
    }
  }


  void show() {
    out.beginDraw();
    out.background(0);

    // Show all particles
    for (Particle p : particles) p.show(out);

    // Draw output to cv
    out.endDraw();
    image(out, showPos.x, showPos.y, showSize.x, showSize.y);
  }

  // #endregion
}


public class Particle {

  // #region - Setup

  // Declare variables
  PrimordialSim sim;
  PVector pos, nextPos;
  float phi, nextPhi;
  float rad;
  color col;

  float r, alpha, beta, v;



  Particle(PrimordialSim sim_,
    PVector pos_, float rad_,
    float r_, float alpha_, float beta_, float v_) {

    // Initialize variables
    sim = sim_;
    pos = pos_.copy();
    nextPos = pos.copy();
    phi = random(360);
    nextPhi = phi;
    rad = rad_;
    col = color(0, 41, 255);

    r = r_;
    alpha = alpha_;
    beta = beta_;
    v = v_;
  }

  // #endregion



  // #region - Main

  void update() {
    // Count particles in left / right semicircle
    int l = 0, r = 0, n_r = 0, n_sr = 0;
    for (Particle p : sim.particles) {
      if (p != this) {

        // Get direction
        float dx = p.pos.x - pos.x;
        float dy = p.pos.y - pos.y;
        float distSq = dx * dx + dy * dy;

        // If within range
        if (distSq < r * r) {
          float deltaPhi = atan2(dy, dx) - phi;

          // Increment counters
          n_r++;
          if (deltaPhi <= 0) l++;
          else if (deltaPhi > 0) r++;
          if (distSq < (r * 0.2) * (r * 0.2)) n_sr++;
        }
      }
    }

    // Calculate rotation based on values
    float deltaPhi = alpha + radians(beta) * n_r * ((r - l) >= 0 ? 1 : -1);

    // Update position and rotation
    nextPhi = phi + deltaPhi;
    nextPos = pos.add(new PVector(cos(nextPhi), sin(nextPhi)).mult(v));

    // Update color
    if (n_sr > 15) col = color(171, 68, 196);
    else if (n_r >= 13 && n_r <= 15) col = color(51, 48, 48);
    else if (n_r < 35) col = color(207, 218, 76);
    else col = color(65, 244, 109);
  }


  void lateUpdate() {
    // Update pos and phi
    phi = nextPhi;
    pos = nextPos.copy();
  }


  void show(PGraphics out) {
    // Show as ellipse
    out.push();
    out.noStroke();
    out.fill(col);
    out.translate(pos.x, pos.y);
    out.rotate(phi);
    out.ellipse(0, 0, rad * 2, rad * 2);

    // Draw line indicating direction
    out.stroke(0);
    out.line(0, 0, rad, 0);
    out.pop();
  }

  // #endregion
}
