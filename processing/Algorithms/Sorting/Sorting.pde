
// #region  - setup

boolean toSort;
int currentSorter;
Sorter[] sorters;


void setup() {
  size(600, 600);
  textAlign(CENTER);
  setupVariables();
}


void setupVariables() {
  toSort = false;
  currentSorter = 0;
  sorters = new Sorter[] {
    new Insertion(200, new PVector(50, 50), new PVector(500, 500)),
    new Bubble(200, new PVector(50, 50), new PVector(500, 500)),
    new Quick(200, new PVector(50, 50), new PVector(500, 500)),
  };
}

// #endregion


// #region - draw

void draw() {
  background(0);
  sorters[currentSorter].showValues();
  if (toSort) {
    sorters[currentSorter].singleUpdate();
  }

  noStroke();
  fill(255);
  text("(Q) Fully sort", width/4, height - 20);
  text("(TAB) To sort: " + toSort, width/2, height - 20);
  text("(W) Reset", 3*width/4, height - 20);
}

// #endregion


// #region - Input

void keyPressed() {
  if (keyCode == 37) {
    currentSorter = (currentSorter+sorters.length -1) % sorters.length;
    sorters[currentSorter].resetVariables();

  } else if (keyCode == 39) {
    currentSorter = (currentSorter+sorters.length +1) % sorters.length;
    sorters[currentSorter].resetVariables();

  } else if (keyCode == 9) {
    toSort = !toSort;

  } else if (keyCode == 81) {
    sorters[currentSorter].fullUpdate();

  } else if (keyCode == 87) {
    sorters[currentSorter].resetVariables();
  }
}

// #endregion
