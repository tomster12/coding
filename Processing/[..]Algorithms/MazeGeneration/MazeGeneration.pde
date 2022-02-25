
// #region  - setup

boolean toGenerate;
int currentGen;
Generator[] generators;


void setup() {
  size(600, 600);
  textAlign(CENTER);
  setupVariables();
}


void setupVariables() {
  toGenerate = false;
  currentGen = 0;
  generators = new Generator[] {
    new DepthFirst(new PVector(50, 50), new PVector(50, 50), new PVector(500, 500)),
    new Kruskal(new PVector(50, 50), new PVector(50, 50), new PVector(500, 500)),
    new Prims(new PVector(50, 50), new PVector(50, 50), new PVector(500, 500))
  };
}

// #endregion


// #region - draw

void draw() {
  background(0);
  generators[currentGen].showMap();
  if (toGenerate) {
    generators[currentGen].singleUpdate();
  }

  noStroke();
  fill(255);
  text("(Q) Fully generate", width/4, height - 20);
  text("(TAB) To generate: " + toGenerate, width/2, height - 20);
  text("(W) Reset", 3*width/4, height - 20);
}

// #endregion


// #region - Input

void keyPressed() {
  if (keyCode == 37) {
    currentGen = (currentGen+generators.length -1) % generators.length;
    generators[currentGen].resetVariables();

  } else if (keyCode == 39) {
    currentGen = (currentGen+generators.length +1) % generators.length;
    generators[currentGen].resetVariables();


  } else if (keyCode == 9) {
    toGenerate = !toGenerate;

  } else if (keyCode == 81) {
    generators[currentGen].fullUpdate();

  } else if (keyCode == 87) {
    generators[currentGen].resetVariables();
  }
}

// #endregion
