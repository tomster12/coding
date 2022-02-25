
// #region - Setup

int[] values;


void setup() {
  size(600, 600);
  setupVariables();
}


void setupVariables() {
  randomizeValues(300, 1);
}

// #endregion


// #region - Main

void draw() {
  background(0);
  drawValues();
}


void drawValues() {
  float sx = width / values.length;
  float max = 0;
  for (int i = 0; i < values.length; i++) {
    if (values[i] > max) {
      max = values[i];
    }
  }

  noStroke();
  fill(255);
  for (int i = 0; i < values.length; i++) {
    float sy = map(values[i], 0, max, 0, height/2);
    rect(i*sx, height-sy, sx, sy);
  }
}

// #endregion


// #region - Input

void keyPressed() {
  if (keyCode == 9) {
    randomizeValues(300, 1);
  } else if (keyCode == 81) {
    sortValues2();
  }
}

// #endregion


// #region - Sorting

// #region - Random values

void randomizeValues(int amount, int type) {
  values = new int[amount];
  if (type == 0) {
    for (int i = 0; i < amount; i++) {
      values[i] = floor(random(0, amount+1));
    }

  } else if (type == 1) {
    ArrayList<Integer> openIndexes = new ArrayList<Integer>();
    for (int i = 0; i < amount; i++) openIndexes.add(i);
    for (int i = 0; i < amount; i++) {
      int rInd = floor(random(openIndexes.size()));
      int rVal = openIndexes.get(rInd);
      values[i] = rVal;
      openIndexes.remove(rInd);
    }
  }
}

// #endregion


// #region - Sorting type 0 (quick)

void sortValues0() {

}

// #endregion


// #region - Sorting type 1 (bubble)

void sortValues1() {

}

// #endregion


// #region - Sorting type 2 (Insertion)

void sortValues2() {
  for (int i = 0; i < values.length; i++) {
    int minInd = i;
    int minVal = values[i];

    for (int j = i+1; j < values.length; j++) {
      if (values[j] < minVal) {
        minInd = j;
        minVal = values[j];
      }
    }

    int tmp = values[i];
    values[i] = minVal;
    values[minInd] = tmp;
  }
}

// #endregion

// #endregion
