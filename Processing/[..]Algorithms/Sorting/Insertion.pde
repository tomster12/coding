
class Insertion extends Sorter {

  int currentIndex;


  Insertion(int size, PVector pos, PVector drawSize) {
    super(size, pos, drawSize, "Insertion");
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
  }


  @Override
  void singleUpdate() {
    if (!sorted) {

      int smallest = values[currentIndex];
      int smallestIndex = currentIndex;
      for (int i = currentIndex; i < size; i++) {
        if (values[i] < smallest) {
          smallest = values[i];
          smallestIndex = i;
        }
      }

      int tmp = values[currentIndex];
      values[currentIndex] = smallest;
      values[smallestIndex] = tmp;

      currentIndex++;
      if (currentIndex == size) {
        sorted = true;
      }
    }
  }
}
