

// #region - Setup

int globalDataSize; // Global Unit Variables
int[][] globalDataRange;
PVector globalUnitPos;
PVector globalTargetPos;


ArrayList<Button> buttons; // Main variables
GenAlgorithm genAl;
int updatesPerFrame;


void setup() {
  size(700, 700);
  noStroke();
  fill(255);
  textSize(15);

  setupVariables();
  setupButtons();
}


void setupVariables() {
  globalDataSize = 500; // GLobal Unit Config Variables
  globalDataRange = new int[][] {
    {-8, 8},
    {-8, 8}
  };
  globalUnitPos = new PVector(350, 500);
  globalTargetPos = new PVector(350, 200);

  int updateAmount = 1000; // Local Gen Algorithm Config Variables
  int populationSize = 500;
  float mutationRate = 0.02;

  buttons = new ArrayList<Button>(); // Main variables
  genAl = new GenAlgorithm(updateAmount, populationSize, mutationRate);
  updatesPerFrame = 1;
}


void setupButtons() {
  buttons.add(new Button(new PVector(10, 10), new PVector(20, 20), "+", 0));
  buttons.add(new Button(new PVector(width - 55, 10), new PVector(20, 20), ">>", 2));
  buttons.add(new Button(new PVector(width - 30, 10), new PVector(20, 20), "=>", 3));
  buttons.add(new Button(new PVector(width - 30, 35), new PVector(20, 20), "->", 1));
  buttons.add(new Button(new PVector(width - 30, 60), new PVector(20, 20), "<>", 4));
  buttons.add(new Button(new PVector(width - 55, 85), new PVector(20, 20), "+", 5));
  buttons.add(new Button(new PVector(width - 30, 85), new PVector(20, 20), "-", 6));
}

// #endregion


// #region - Update Functions

void draw() {
  background(100);
  updateGenAlgorithm();
  updateUI();
  showOther();
}


void updateGenAlgorithm() {
  for (int i = 0; i < updatesPerFrame; i++) {
    genAl.updateGeneration();
  }
}


void updateUI() {
  noStroke();
  fill(200);

  textAlign(LEFT);
  text("Generated: " + (genAl.population.size() > 0),
  45, 25 + 25 * 0);
  text("Pop size: " + genAl.population.size(),
  45, 25 + 25 * 1);
  text("Generation: " + genAl.generationCount,
  45, 25 + 25 * 2);
  text("Best Fitness: " + genAl.bestFitness,
  45, 25 + 25 * 3);

  textAlign(RIGHT);
  text("To update: " + genAl.toUpdate,
  width - 65, 25 + 25 * 0);
  text("Finished: " + (!genAl.ready && genAl.population.size() != 0),
  width - 65, 25 + 25 * 1);
  text("Auto Finish: " + genAl.toFinish,
  width - 65, 25 + 25 * 2);
  text("Updates Per Second: " + updatesPerFrame,
  width - 65, 25 + 25 * 3);
  text("Updates: " + genAl.updateCount,
  width - 65, 25 + 25 * 4);

  for (int i = 0; i < buttons.size(); i++) {
    buttons.get(i).update();
  }
}


void showOther() {
  noStroke();
  fill(200);
  ellipse(globalTargetPos.x, globalTargetPos.y, 10, 10);
}

// #endregion


// #region - Input Functions

void mousePressed() {
  int pressed = -1;
  for (int i = 0; i < buttons.size(); i++) {
    if (buttons.get(i).hovered) {
      pressed = buttons.get(i).buttonFunctionType;
    }
  }
  buttonFunction(pressed);
}


void buttonFunction(int pressed) {
  if (pressed == -1) {
  } else if (pressed == 0) {
    genAl.createGeneration();
  } else if (pressed == 1) {
    genAl.finishGeneration();
  } else if (pressed == 2) {
    genAl.fullUpdateGeneration();
  } else if (pressed == 3) {
    genAl.toUpdate = !genAl.toUpdate;
  } else if (pressed == 4) {
    genAl.toFinish = !genAl.toFinish;
  } else if (pressed == 5) {
    updatesPerFrame++;
  } else if (pressed == 6) {
    updatesPerFrame--;
  }
}

// #endregion


// #region - Other Functions

void fullQuicksort(ArrayList<GenUnit> population) { // ArrayList, value = list.get(ind).getFitness()
  qsSort(population, 0, population.size() - 1);
}


void qsSort(ArrayList<GenUnit> a, int lo, int hi) {
  if (lo < hi) {
    int p = qsPartition(a, lo, hi);
    qsSort(a, lo, p - 1);
    qsSort(a, p + 1, hi);
  }
}


int qsPartition(ArrayList<GenUnit> a, int lo, int hi) {
  float pivot = qsValue(a, hi);
  int i = lo;
  for (int j = lo; j < hi; j++) {
    if (qsValue(a, j) > pivot) {
      if (i != j) {
        GenUnit pI = a.get(i);
        a.set(i, a.get(j));
        a.set(j, pI);
      }
      i++;
    }
  }
  GenUnit pI = a.get(i);
  a.set(i, a.get(hi));
  a.set(hi, pI);
  return i;
}


float qsValue(ArrayList<GenUnit> pop, int ind) {
  return pop.get(ind).fitness;
}


PVector[] randomData() {
  PVector[] d = new PVector[globalDataSize];
  for (int i = 0; i < globalDataSize; i++) {
    d[i] = randomDataSection();
  }
  return d;
}


PVector randomDataSection() {
  return new PVector(
    random(globalDataRange[0][0], globalDataRange[0][1]),
    random(globalDataRange[1][0], globalDataRange[1][1])
  );
}

// #endregion
