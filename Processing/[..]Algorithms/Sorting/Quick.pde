
class Quick extends Sorter {

  ArrayList<int[]> toSort;


  Quick(int size, PVector pos, PVector drawSize) {
    super(size, pos, drawSize, "Quick");
    resetVariables();
  }


  @Override
  void resetVariables() {
    sorted = false;
    values = new int[size];
    for (int i = 0; i < values.length; i++) {
      values[i] = floor(random(100));
    }
    toSort = new ArrayList<int[]>();
    toSort.add(new int[] {0, size-1});
  }


  @Override
  void singleUpdate() {
    if (!sorted) {
      if (toSort.size() == 0) {
        sorted = true;

      } else {
        int lo = toSort.get(0)[0];
        int hi = toSort.get(0)[1];
        int pivot = values[hi];
        int i = lo;

        for (int j = lo; j < hi; j++) {
          if (values[j] < pivot) {
            int tmp = values[i];
            values[i] = values[j];
            values[j] = tmp;
            i++;
          }
        }

        int tmp = values[i];
        values[i] = pivot;
        values[hi] = tmp;
        toSort.remove(0);
        if (i+1<hi) toSort.add(0, new int[] {i+1, hi});
        if (lo<i-1) toSort.add(0, new int[] {lo, i-1});
      }
    }
  }
}
