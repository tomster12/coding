class unit {


  PVector pos;
  boolean done;
  float fitness;
  data data;
  boolean best;
  int dataIterations;


  //------------------------------------------------------------

  unit() {
    pos = new PVector(random(spawnPos.x, spawnRange.x), random(spawnPos.y, spawnRange.y));
    best = false;

    setupVariables();
  }


  void setupVariables() {
    done = false;
    fitness = 0;
    dataIterations = 0;
  }


  //------------------------------------------------------------


  void update() { 
    if (!done) {
      float[] inputs = new float[] {pos.x / width,  pos.y / height, target.x / width, target.y / height};
      float[][] outputs = Propogate(data.network, inputs, false);
      pos.x += outputs[outputs.length - 1][0] * 10 - 5;
      pos.y += outputs[outputs.length - 1][1] * 10 - 5;
      dataIterations++;

      if (dataIterations > dataSize) {
        float d = dist(pos.x, pos.y, target.x, target.y);
        fitness = 1 / (d * d);
        done = true;
      }

      if (dist(pos.x, pos.y, target.x, target.y) < (unitSize / 2 + targetSize / 2)) {
        fitness = 1 +  4 * ((dataSize - dataIterations) / dataSize);
        done = true;
      }

      if (pos.x - unitSize / 2 < 0 || pos.x + unitSize / 2 > width || pos.y - unitSize / 2 < 0 || pos.y + unitSize / 2 > height) {
        fitness = 0;
        done = true;
      }
    }
  }


  //------------------------------------------------------------


  void show() {
    if (best) {
      fill(100, 200, 100);
    } else {
      fill(150);
    }
    stroke(100);
    ellipse(pos.x, pos.y, unitSize, unitSize);
  }


  boolean getDone() {
    return done;
  }


  float getFitness() {
    return fitness;
  }
}
