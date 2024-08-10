

class FourierDrawer {
  // #region - Setup

  ArrayList<PVector> positions;
  float time;
  PVector ftPos;
  float ftScale;
  float ftSpeed;

  ArrayList<Float> path;
  boolean showGraph;
  PVector gPos;
  float gScale;


  FourierDrawer(
  float ftSpeed_, PVector ftPos_, float ftScale_,
  boolean showGraph_, PVector gPos_, int gScale_) {

    positions = new ArrayList<PVector>();
    time = 0;
    ftSpeed = -ftSpeed_;
    ftPos = ftPos_;
    ftScale = ftScale_;

    path = new ArrayList<Float>();
    showGraph = showGraph_;
    gPos = gPos_;
    gScale = gScale_;
  }

  // #endregion


  // #region - Main

  void updateFourier() {
    updateSeries();
    updateGraph();
  }


  void updateSeries() {
    stroke(255);
    noFill();

    time += ftSpeed;
    int amount = 20;
    positions.clear();
    positions.add(ftPos.copy());

    for (int i = 0; i < amount; i++) {
      PVector prevPos = positions.get(i);
      PVector curPos = prevPos.copy();

      // θ = time
      // 4sinθ/π  4sin3θ/3π  4sin5θ/5π
      float freq = i*2 + 1;
      float amp = ftScale * 4/(freq*PI);
      curPos.x += cos(freq*time) * amp;
      curPos.y += sin(freq*time) * amp;
      positions.add(curPos);

      line(prevPos.x, prevPos.y, curPos.x, curPos.y);
      ellipse(prevPos.x, prevPos.y, amp*2, amp*2);
    }
  }


  void updateGraph() {
    if (showGraph) {
      stroke(50, 200, 50);
      noFill();
      PVector lastPos = positions.get(positions.size() - 1);
      line(lastPos.x, lastPos.y, gPos.x, lastPos.y);
      path.add(0, lastPos.y);

      stroke(255);
      noFill();
      for (int i = 0; i < path.size() - 1; i++) {
        float p1X = gPos.x + i;
        float p1Y = path.get(i);
        float p2X = gPos.x + i+1;
        float p2Y = path.get(i+1);
        line(p1X, p1Y, p2X, p2Y);
      }

      if (path.size() > gScale) {
        path.remove(path.size()-1);
      }
    }
  }

  // #endregion
}
