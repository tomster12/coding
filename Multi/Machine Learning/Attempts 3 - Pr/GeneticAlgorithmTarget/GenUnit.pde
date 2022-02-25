

class GenUnit {

  // #region - Setup

  PVector pos; // Config Variables
  PVector targetPos;

  int movementCounter; // Local variables
  float fitness;
  float normalizedFitness;
  float accumulatedNormalizedFitness;
  boolean hitTarget;

  PVector[] movements; // Data Variables


  GenUnit() {
    setupVariables();
  }


  GenUnit(PVector[] movements_) {
    movements = movements_;
    setupVariables();
  }


  void setupVariables() {
    pos = globalUnitPos.copy(); // Config Variables
    targetPos = globalTargetPos.copy();

    movementCounter = 0; // Local Variables
    fitness = 0;
    normalizedFitness = 0;
    accumulatedNormalizedFitness = 0;
    hitTarget = false;

    if (movements == null) { // Data Variables
      movements = randomData();
    }
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
    if (movementCounter == globalDataSize || hitTarget) {
      return true;
    } else {
      return false;
    }
  }


  void updateFitness() { // NEEDED
    if (hitTarget) {
      fitness = 1 + 5 * (1 - (float)movementCounter / movements.length); // 1 - 6 for reached with 100 - 0 steps
    } else {
      float d = dist(pos.x, pos.y, targetPos.x, targetPos.y) - 15;
      d = d < 1 ? 1 : d;
      fitness = 1 / (float)Math.pow(d, 2); // 0 - 1 for far away to reached quadratic
    }
  }

  // #endregion


  // #region - Custom Unit Functions

    void update() {
      if (!hitTarget && movementCounter < movements.length) {
        movement();
        if (dist(pos.x, pos.y, targetPos.x, targetPos.y) < 15) {
          hitTarget = true;
        }
      }
    }


    void show() {
      stroke(200);
      fill(150);
      ellipse(pos.x, pos.y, 20, 20);
    }


    void movement() {
      pos.add(movements[movementCounter]);
      movementCounter++;
    }

  // #endregion

}
