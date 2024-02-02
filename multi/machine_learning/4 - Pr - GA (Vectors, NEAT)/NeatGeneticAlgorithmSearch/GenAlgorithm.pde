

class GenAlgorithm {
  // #region - Setup

  int updateLimit; // Config Variables
  int populationSize;
  int gUnitCNetSize;
  int updatesPerFrame;

  boolean generated; // Local Variables
  boolean toUpdate;
  boolean toFinish;
  boolean ready;
  int updateCount;
  int generationCount;
  ArrayList<GenUnit> population;
  ArrayList<GenUnit> populationStorage;
  boolean showingExample;
  GenUnit bestUnit;
  double bestFitness;
  Network bestNet;
  NetDrawer bestDrawer;
  NetDrawer netDrawer;
  GenUnit selectedUnit;

  int[] ioSize; // GenUnit Variables
  float[] wRange;
  InnoManager innoMng;

  int foodAmount;
  float foodSize;
  ArrayList<PVector> food;


  GenAlgorithm() {
    updateLimit = 10000; // Config Variables
    populationSize = 150;
    updatesPerFrame = 1;

    generated = false; // Local Variables
    toUpdate = false;
    toFinish = false;
    resetVariables();

    ioSize = new int[] {5, 3}; // GenUnit Variables
    wRange = new float[] {-1, 1};
    innoMng = new InnoManager(ioSize);
  }


  void resetVariables() { // Full reset of variables
    ready = true;
    updateCount = 0;
    generationCount = 0;
    population = new ArrayList<GenUnit>();
    populationStorage = new ArrayList<GenUnit>();
    showingExample = false;
    bestFitness = 0;

    foodAmount = 1000;
    foodSize = 4;
    food = new ArrayList<PVector>();
    for (int i = 0; i < foodAmount; i++) food.add(new PVector(random(width), random(height)));
  }


  void createGeneration() { // Create a new default generation
    resetVariables();
    for (int i = 0; i < populationSize; i++) {
      population.add(new GenUnit(innoMng, ioSize, wRange));
      for (int o = 0; o < 5; o++) population.get(i).net.mutate();
    }
    generated = true;
  }

  // #endregion


  // #region - Main Functions

  void updateGeneration() { // (CALLED EACH FRAME), updates and finishes when needed
    if (generated) {
      for (int i = 0; i < updatesPerFrame; i++) {
        if (ready && toUpdate) {
          unitUpdateGeneration();
        } else if (!ready && toFinish) {
          finishGeneration();
        }
      }
    }
  }


  void showGeneration() { // (CALLED EACH FRAME), Show all units
    GenUnit hoveringGenUnit = null;
    for (int i = 0; i < population.size(); i++) { // Call show all gen units
      GenUnit p = population.get(i);
      p.callShow();
      if (p.ontop()) hoveringGenUnit = p;
    }

    noStroke();
    fill(200);
    if (hoveringGenUnit != null && mousePressed) { // If hovering over a genunit then show its network
      selectedUnit = hoveringGenUnit;
      netDrawer = new NetDrawer(selectedUnit.net, new PVector(0, 200), new PVector(200, 200), 10);
    }
    if (selectedUnit != null) {
      text((float)selectedUnit.life, 100, height-30);
      text((float)selectedUnit.score, 100, height-10);
    }

    stroke(20, 80, 20);
    fill(100, 200, 100);
    for (int i = 0; i < food.size(); i++) ellipse(food.get(i).x, food.get(i).y, foodSize, foodSize);

    if (netDrawer != null) netDrawer.drawNetwork();
    if (bestDrawer != null) bestDrawer.drawNetwork();
  }


  void fullUpdateGeneration() { // (BUTTON FUNCTION) Update all units in population - Will update till finished OR finish
    if (generated) {
      if (!ready) {
        finishGeneration();
      } else {
        while (ready) {
          unitUpdateGeneration();
        }
      }
    }
  }


  void unitUpdateGeneration() { // (USED BY OTHER) Single update to all units in population
    boolean finished = true;
    for (int i = 0; i < population.size(); i++) { // Calls update and checks if all finished
      GenUnit un = population.get(i);
      un.callUpdate();
      boolean f = un.getDone();
      finished = !f ? f : finished;
    }

    if ((finished || updateCount >= updateLimit) && !showingExample) { // If all finished or over update limit then changes to not ready
      ready = false;
    } else {
      updateCount++;
    }
  }


  void finishGeneration() { // (USED BY OTHER) Generation has finished
    if (!ready && generated) {
      fitnessGeneration();
      sortGeneration();
      cullGeneration();
      breedGeneration();
      nextGeneration();
    }
  }


  void toggleExample() {
    if (showingExample) {
      println("Refilling population");
      population.clear();
      for (int i = 0; i < populationStorage.size(); i++) {
        population.add(populationStorage.get(i));
      }
      populationStorage.clear();
      showingExample = !showingExample;

    } else {
      println("Clearing population");
      populationStorage.clear();
      for (int i = 0; i < population.size(); i++) {
        populationStorage.add(population.get(i));
      }
      population.clear();
      population.add(populationStorage.get(0));
      showingExample = !showingExample;
    }
  }

  // #endregion


  // #region - Finish Generation Functions

  void fitnessGeneration() {
    getBestFitnessGeneration();
    for (int i = 0; i < population.size(); i++) { // Update all units fitness
      GenUnit p = population.get(i);

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


  void getBestFitnessGeneration() {
    bestFitness = -1;
    bestNet = null;
    bestDrawer = null;

    for (int i = 0; i < population.size(); i++) { // Get genUnit with best fitness
      GenUnit p = population.get(i);
      p.updateFitness();
      if (p.fitness > bestFitness) {
        bestFitness = p.fitness;
        bestUnit = p;
      }
    }

    if (bestUnit != null) {
      bestFitness = bestUnit.fitness; // Update values
      bestNet = bestUnit.net;
      bestDrawer = new NetDrawer(bestUnit.net, new PVector(0, 400), new PVector(200, 200), 10);
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

    food = new ArrayList<PVector>();
    for (int i = 0; i < foodAmount; i++) food.add(new PVector(random(width), random(height)));
    population.clear();
    for (int i = 0; i < newPop.size(); i++) { // Update Variables
      population.add(newPop.get(i));
    }
    population.set(0, new GenUnit(innoMng, ioSize, wRange, bestNet));
  }


  void nextGeneration() {
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
