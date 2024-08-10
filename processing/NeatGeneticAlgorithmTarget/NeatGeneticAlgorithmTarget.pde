

// #region - Setup

ArrayList<Button> buttons; // Main variables
GenAlgorithm genAl;
int updatesPerFrame;
PVector target;
ArrayList<Float> times;


void setup() {
  size(700, 700);
  noStroke();
  fill(255);
  textSize(15);

  setupVariables();
  setupButtons();
}


void setupVariables() {
  buttons = new ArrayList<Button>(); // Main variables
  genAl = new GenAlgorithm();
  updatesPerFrame = 1;
  target = new PVector(350, 350);
  times = new ArrayList<Float>();
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
  genAl.showGeneration();
}


void updateUI() {
  noStroke();
  fill(200);
  textSize(10);

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

  textAlign(CENTER);
  for (int i = 0; i < times.size(); i++) {
    text(times.get(i) + "ms", 350, 10 + i * 10);
  }
  for (int i = 0; i < buttons.size(); i++) {
    buttons.get(i).update();
  }
}


void showOther() {
  noStroke();
  fill(100, 200, 100);
  ellipse(target.x, target.y, 20, 20);
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

void fullQuicksort(ArrayList<GenUnit> population) { // Quicksort for genAl, highest first
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

// #endregion
