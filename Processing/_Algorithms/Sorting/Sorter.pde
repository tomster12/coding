
class Sorter {
  // #region - Setup

  int size;
  PVector pos;
  PVector drawSize;
  String name;

  int[] values;
  boolean sorted;

  Sorter(int size_, PVector pos_, PVector drawSize_, String name_) {
    size = size_;
    pos = pos_;
    drawSize = drawSize_;
    name = name_;

    values = new int[size];
    sorted = false;
  }

  // #endregion


  // #region - Main

  void showValues() {
    int maxValue = 0;
    for (int i = 0; i < values.length; i++) {
      if (values[i] > maxValue) maxValue = values[i];
    }

    noStroke();
    fill(255);
    float xDif = drawSize.x/(float)size;
    for (int i = 0; i < values.length; i++) {
      float sx = xDif;
      float sy = drawSize.y * values[i]/(float)maxValue;
      float px = pos.x + i*xDif;
      float py = pos.y + drawSize.y - sy;
      rect(px, py, sx, sy);
    }

    text("Sorter: " + name, width/2, 20);
    text("Sorted: " + sorted, width/2, 40);
  }


  void fullUpdate() {
    while (!sorted) {
      singleUpdate();
    }
  }

  // #endregion


  // #region - Other

  void resetVariables() {}
  void singleUpdate() {}

  // #endregion
}
