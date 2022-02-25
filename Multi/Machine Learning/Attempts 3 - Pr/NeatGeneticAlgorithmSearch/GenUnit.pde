

class GenUnit {
  // #region - Setup

  InnoManager innoMng;
  int[] ioSize;
  float[] wRange;
  Network net;

  double fitness;
  double normalizedFitness;
  double accumulatedNormalizedFitness;

  float[] inputs;
  boolean alive;
  PVector pos;
  float size;
  float rotSpeed;
  float moveSpeed;
  float angle;
  float life;
  float score;
  float length;


  GenUnit(InnoManager innoMng_, int[] ioSize_, float[] wRange_, Network net_) {
    innoMng = innoMng_;
    ioSize = ioSize_;
    wRange = wRange_;
    net = net_;
    setupVariables();
  }


  GenUnit(InnoManager innoMng_, int[] ioSize_, float[] wRange_) {
    innoMng = innoMng_;
    ioSize = ioSize_;
    wRange = wRange_;
    net = new Network(innoMng, ioSize, wRange);
    net.mutate();
    setupVariables();
  }


  void setupVariables() {
    fitness = 0;
    normalizedFitness = 0;
    accumulatedNormalizedFitness = 0;

    inputs = new float[ioSize[0]];
    for (int i = 0; i < 5; i++) inputs[i] = 0.0;
    alive = true;

    while (true) {
      boolean found = false;
      pos = new PVector(random(width), random(height));
      for (int i = 0; i < genAl.food.size(); i++) {
        PVector fp = genAl.food.get(i);
        float cs = size/2 + genAl.foodSize/2;
        if (distSq(pos.x, pos.y, fp.x, fp.y) < cs*cs) {
          found = true;
        }
      }
      if (!found) break;
    }

    size = 5;
    rotSpeed = 0.1;
    moveSpeed = 1.4;
    angle = random(1) * 255;
    life = 50;
    score = 0;
    length = 50;
  }

  // #endregion


  // #region - Needed Functions

  void callUpdate() { // NEEDED
    if (alive) {
      if (pos.x<0)pos.x=0;
      if (pos.y<0)pos.y=0;
      if (pos.x>width)pos.x=width;
      if (pos.y>height)pos.y=height;

      for (int i = -2; i <= 2; i++) {
        float ca = angle + i * PI / 8.0;
        inputs[i+2] = 0.0;

        for (int o = 0; o < 5; o++) {
          float cl = length * o / 4.0;
          float nx = pos.x + cos(ca) * cl;
          float ny = pos.y + sin(ca) * cl;

          for (int p = 0; p < genAl.food.size(); p++) {
            PVector fp = genAl.food.get(p);
            if (dist(nx, ny, fp.x, fp.y) < genAl.foodSize/2 + length/10.0) {
              inputs[i+2] = 1.0;
            }
          }
        }
      }

      float[] outputs = net.propogate(inputs);
      angle += outputs[0] * (PI / 4.0) * rotSpeed;
      angle += outputs[1] * (-PI / 4.0) * rotSpeed;
      pos.x += cos(angle) * outputs[2] * moveSpeed;
      pos.y += sin(angle) * outputs[2] * moveSpeed;

      for (int i = 0; i < genAl.food.size(); i++) {
        PVector fp = genAl.food.get(i);
        if (dist(pos.x, pos.y, fp.x, fp.y) < size/2 + genAl.foodSize/2) {
          life += 15;
          score += 10;
          genAl.food.remove(i);
          break;
        }
      }

      score += 0.001;
      life -= 0.15;
      if (life < 0) alive = false;
    }
  }


  void callShow() { // NEEDED
    stroke(220);
    fill(map(life, 50, 0, 100, 200), 100, 100);
    ellipse(pos.x, pos.y, size, size);
    line(pos.x, pos.y, pos.x + cos(angle) * size/2, pos.y + sin(angle) * size/2);

    // for (int i = -2; i <= 2; i++) {
    //   if (inputs[i+2]==0.0) stroke(200,100,100);
    //   if (inputs[i+2]==1.0) stroke(100,200,100);
    //   float ca = angle + i * PI / 8.0;
    //   float nx = pos.x + cos(ca) * length;
    //   float ny = pos.y + sin(ca) * length;
    //   line(pos.x, pos.y, nx, ny);
    // }
  }


  boolean getDone() { // NEEDED
    return !alive;
  }


  void updateFitness() { // NEEDED
    fitness = score;
  }


  boolean ontop() { // NEEDED
    return dist(mouseX, mouseY, pos.x, pos.y) < size/2;
  }

  // #endregion


  // #region - Custom Unit Functions

  // #endregion
}
