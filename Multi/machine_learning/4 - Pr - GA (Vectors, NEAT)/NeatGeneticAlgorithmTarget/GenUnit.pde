

class GenUnit {
  // #region - Setup

  InnoManager innoMng;
  int[] ioSize;
  float[] wRange;
  Network net;

  float fitness;
  float normalizedFitness;
  float accumulatedNormalizedFitness;
  float[] inputs;
  int updateIterations;
  int updateLimit;

  PVector pos;
  float showSize;
  float speed;
  boolean reached;
  boolean highlighted;


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
    updateIterations = 0;
    updateLimit = 750;

    pos = new PVector(random(700), random(300));
    showSize = 20;
    speed = 1;
    reached = false;
    highlighted = false;
  }

  // #endregion


  // #region - Needed Functions

  void callUpdate() { // NEEDED
    update();
  }


  void callShow() { // NEEDED
    show();
  }


  boolean getDone() { // NEEDED
    if (updateIterations >= updateLimit) {
      return true;
    }
    if (reached) {
      return true;
    }
    return false;
  }


  void updateFitness() { // NEEDED
    if (reached) {
      float nSize = net.connections.size() + net.neurons.size();
      fitness = 1 + 1/(float)Math.pow(updateIterations, 2) + 20/(float)Math.pow(nSize, 2);
    } else {
      fitness = 1/(float)Math.pow(dist(pos.x, pos.y, target.x, target.y), 2);
    }
  }

  // #endregion


  // #region - Custom Unit Functions

    void update() {
      if (!reached && updateIterations < updateLimit) {
        inputs = new float[] {target.x - pos.x, target.y - pos.y};
        float[] outputs = net.propogate(inputs);
        pos.x += outputs[0] * 2 * speed - speed;
        pos.y += outputs[1] * 2 * speed - speed;
        updateIterations++;
        if (dist(pos.x, pos.y, target.x, target.y) < showSize) {
          reached = true;
        }
      }
    }


    void show() {
      noStroke();
      fill(200, 100);
      if (highlighted) {
        fill(100, 200, 100);
      }
      ellipse(pos.x, pos.y, showSize, showSize);
    }


    boolean ontop() {
      if (dist(mouseX, mouseY, pos.x, pos.y) < showSize) {
        return true;
      }
      return false;
    }

  // #endregion
}
