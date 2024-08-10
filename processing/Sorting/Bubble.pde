
class Bubble extends Sorter {

  int currentIndex;
  boolean checkSorted;


  Bubble(int size, PVector pos, PVector drawSize) {
    super(size, pos, drawSize, "Bubble");
    resetVariables();
  }


  @Override
  void resetVariables() {
    sorted = false;
    values = new int[size];
    for (int i = 0; i < values.length; i++) {
      values[i] = floor(random(100));
    }

    currentIndex = 0;
    checkSorted = false;
  }


  @Override
  void singleUpdate() {
    if (!sorted) {
      if (currentIndex == size-1) {
        sorted = checkSorted;
        if (!sorted) currentIndex = 0;

      } else {
        if (currentIndex == 0) checkSorted = true;
        if (values[currentIndex+1] < values[currentIndex]) {
          int tmp = values[currentIndex];
          values[currentIndex] = values[currentIndex+1];
          values[currentIndex+1] = tmp;
          checkSorted = false;
        }

        currentIndex++;
      }
    }
  }
}
