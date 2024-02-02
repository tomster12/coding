

class GenAlgorithm {
  // #region - Setup

  int updateLimit; // Config Variables
  int populationSize;
  int gUnitCNetSize;

  boolean generated; // Local Variables
  boolean toUpdate;
  boolean toFinish;
  boolean ready;
  int updateCount;
  int generationCount;
  ArrayList<GenUnit> population;
  float bestFitness;
  Network bestNet;
  NetDrawer bestDrawer;
  NetDrawer netDrawer;

  int[] ioSize; // GenUnit Variables
  float[] wRange;
  InnoManager innoMng;


  GenAlgorithm() {
    updateLimit = 1000; // Config Variables
    populationSize = 2000;

    generated = false; // Local Variables
    toUpdate = false;
    toFinish = false;
    resetVariables();

    ioSize = new int[] {2, 2}; // GenUnit Variables
    wRange = new float[] {-1, 1};
    innoMng = new InnoManager(ioSize);
  }


  void resetVariables() {
    ready = true;
    updateCount = 0;
    generationCount = 0;
    population = new ArrayList<GenUnit>();
    bestFitness = 0;
  }


  void createGeneration() { // Create a new default generation
    resetVariables();
    for (int i = 0; i < populationSize; i++) {
      population.add(new GenUnit(innoMng, ioSize, wRange));
    }
    generated = true;
  }

  // #endregion


  // #region - Main Functions

  void updateGeneration() { // Called each frame, Shows and updates
    if (generated) {
      if (ready && toUpdate) {
        singleUpdateGeneration();
      } else if (!ready && toFinish) {
        finishGeneration();
      }
    }
  }


  void showGeneration() { // Show all units
    for (int i = 0; i < population.size(); i++) {
      population.get(i).callShow();
      if (population.get(i).ontop()) {
        netDrawer = new NetDrawer(population.get(i).net, new PVector(0, 200), new PVector(200, 200), 10);
      }
    }
    if (netDrawer != null) {
      netDrawer.drawNetwork();
    }
    if (bestDrawer != null) {
      bestDrawer.drawNetwork();
    }
  }


  void fullUpdateGeneration() { // Update all units in population
    if (generated) {
      if (!ready) {
        finishGeneration();
      }
      while (ready) {
        singleUpdateGeneration();
      }
    }
  }


  void singleUpdateGeneration() { // Single update to all units in population
    boolean finished = true;
    for (int i = 0; i < population.size(); i++) {
      GenUnit un = population.get(i);
      un.callUpdate();
      boolean f = un.getDone();
      finished = !f ? f : finished;
    }

    if (finished || updateCount >= updateLimit) {
      ready = false;
    } else {
      updateCount++;
    }
  }


  void finishGeneration() { // Generation has finished
    if (!ready && generated) {
      float t = millis();
      fitnessGeneration();
      times.add(millis() - t);

      sortGeneration();
      cullGeneration();
      breedGeneration();
    }
  }

  // #endregion


  // #region - Finish Generation Functions

  void fitnessGeneration() { // Update all units fitness
    for (int i = 0; i < population.size(); i++) {
      GenUnit p = population.get(i);
      p.updateFitness();

      if (p.fitness > bestFitness) {
        p.highlighted = true;
        bestFitness = p.fitness;
        bestNet = p.net;
        bestDrawer = new NetDrawer(p.net, new PVector(0, 400), new PVector(200, 200), 10);
      }

      int amn = 0;
      for (int o = 0; o < population.size(); o++) { // Normalize fitness based on species size
        GenUnit op = population.get(o);
        if (p.net.speciateDistance(op.net) < 1) {
          amn++;
        }
      }
      p.fitness = p.fitness / amn;
    }
  }


  void sortGeneration() { // Sort the units based on fitness - highest first
    fullQuicksort(population);
  }


  void cullGeneration() { // Kill the bottom half of population
    int cullAmount = populationSize / 2;
    for (int i = 0; i < cullAmount; i++) {
      population.remove(population.size() - 1);
    }
  }


  void breedGeneration() { // Breed a new generation
    target = new PVector(random(0, 700), random(400, 700));
    float totFit = 0;
    for (int i = 0; i < population.size(); i++) { // Get total fitness
      GenUnit p = population.get(i);
      totFit += p.fitness;
    }

    float runFit = 0;
    for (int i = 0; i < population.size(); i++) { // Update normalized and accumulated fitness
      GenUnit p = population.get(i);
      p.normalizedFitness = p.fitness / totFit;
      runFit += p.normalizedFitness;
      p.accumulatedNormalizedFitness = runFit;
    }

    ArrayList<GenUnit> newPop = new ArrayList<GenUnit>(); // Make new generation
    for (int i = 0; i < populationSize; i++) {
      GenUnit p1 = pickFromGeneration(null);
      GenUnit p2 = pickFromGeneration(p1);
      Network d = p1.net.crossover(p2.net);
      d.mutate();
      GenUnit n = new GenUnit(innoMng, ioSize, wRange, d);
      newPop.add(n);
    }

    population.clear();
    for (int i = 0; i < newPop.size(); i++) { // Update Variables
      population.add(newPop.get(i));
    }
    population.set(0, new GenUnit(innoMng, ioSize, wRange, bestNet));
    population.get(0).highlighted = true;
    ready = true;
    updateCount = 0;
    generationCount++;
  }


  GenUnit pickFromGeneration(GenUnit np) { // Picks based on fitness
    GenUnit pick = population.get(0);
    int ind = 0;
    boolean found = false;
    int itr = 0;
    while (!found && itr < 1000) {
      itr++;
      float r = random(1); // Pick random
      for (int i = 0; i < population.size(); i++) {
        if (population.get(i).accumulatedNormalizedFitness < r) {
          pick = population.get(i);
          ind = i;
        }
      }
      if (pick != np) { // If different then breed
        found = true;
      }
    }
    return pick;
  }


  Network crossover(GenUnit p1, GenUnit p2) { // Crossover of data from 2 units
    Network n1 = p1.net;
    Network n2 = p2.net;
    Network nn = n1.crossover(n2);
    return nn;
  }

  // #endregion
}
