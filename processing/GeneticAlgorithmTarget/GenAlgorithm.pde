

class GenAlgorithm {

  // #region - Setup

  int updateLimit; // Config Variables
  int populationSize;
  float mutationRate;

  boolean generated; // Local Variables
  boolean toUpdate;
  boolean toFinish;
  boolean ready;
  int updateCount;
  int generationCount;
  float bestFitness;
  ArrayList<GenUnit> population;


  GenAlgorithm(int updateLimit_, int populationSize_, float mutationRate_) {
    updateLimit = updateLimit_; // Config Variables
    populationSize = populationSize_;
    mutationRate = mutationRate_;

    generated = false; // Local Variables
    toUpdate = false;
    toFinish = false;
    resetVariables();
  }


  void resetVariables() {
    ready = true;
    updateCount = 0;
    generationCount = 0;
    bestFitness = 0;
    population = new ArrayList<GenUnit>();
  }


  void createGeneration() { // Create a new default generation
    resetVariables();
    for (int i = 0; i < populationSize; i++) {
      population.add(new GenUnit());
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
      showGeneration();
    }
  }


  void showGeneration() { // Show all units
    for (int i = 0; i < population.size(); i++) {
      population.get(i).callShow();
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
      fitnessGeneration();
      sortGeneration();
      cullGeneration();
      breedGeneration();
    }
  }

  // #endregion


  // #region - Finish Generation Functions

  void fitnessGeneration() { // Update all units fitness
    float best = 0;
    for (int i = 0; i < population.size(); i++) { // Update fitness
      GenUnit p = population.get(i);
      p.updateFitness();
      if (p.fitness > best) {
        best = p.fitness;
      }
    }
    if (best > bestFitness) {
      bestFitness = best;
    }
  }


  void sortGeneration() { // Sort the units based on fitness
    fullQuicksort(population);
  }


  void cullGeneration() { // Kill the bottom half of population
    int cullAmount = populationSize / 2;
    for (int i = 0; i < cullAmount; i++) {
      population.remove(population.size() - 1);
    }
  }


  void breedGeneration() { // Breed a new generation
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
      PVector[] d;
      d = crossover(p1, p2);
      d = mutate(d);
      GenUnit n = new GenUnit(d);
      newPop.add(n);
    }

    population.clear();
    for (int i = 0; i < newPop.size(); i++) { // Update Variables
      population.add(newPop.get(i));
    }
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


  PVector[] crossover(GenUnit p1, GenUnit p2) { // Crossover of data from 2 units
    PVector[] d1 = p1.movements;
    PVector[] d2 = p2.movements;
    PVector[] nd = new PVector[d1.length];
    for (int i = 0; i < nd.length; i++) {
      if (i < nd.length / 2) {
        nd[i] = d1[i].copy();
      } else {
        nd[i] = d2[i].copy();
      }
    }
    return nd;
  }


  PVector[] mutate(PVector[] d) { // Mutates the data
    PVector[] nd = new PVector[d.length];
    for (int i = 0; i < nd.length; i++) {
      if (random(1) < mutationRate) {
        nd[i] = randomDataSection();
      } else {
        nd[i] = d[i].copy();
      }
    }
    return nd;
  }

  // #endregion

}
