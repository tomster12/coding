

class Gate {
  // #region - Setup

  PVector pos;
  int type;
  Boolean selected;

  Boolean manualIn;
  ArrayList<Boolean> in;
  Boolean out;
  ArrayList<Connection> connections;


  Gate(PVector pos_, int type_) {
    pos = pos_;
    type = type_;

    manualIn = false;
    in = new ArrayList<Boolean>();
    out = false;
    selected = false;
    connections = new ArrayList<Connection>();
  }

  // #endregion


  // #region - Main

  void update() {
    if (selected)
      updatePos();

    drawBody();
    drawOutput();
    drawType();
  }


  void updatePos() {
    pos = new PVector(nMouseX, nMouseY);
  }


  void drawBody() {
    stroke(colours[4]);
    strokeWeight(strokeWeights[0]);
    fill(colours[3]);
    ellipse(pos.x, pos.y, gateSize, gateSize);
  }


  void drawOutput() {
    stroke(colours[5]);
    strokeWeight(strokeWeights[1]);
    fill(out ? colours[1] : colours[2]);
    ellipse(pos.x, pos.y, IOSize, IOSize);

    if (manualIn) {
      stroke(colours[1]);
      strokeWeight(strokeWeights[4]);
      noFill();
      ellipse(pos.x, pos.y, IOSize*2, IOSize*2);
    }
  }


  void drawType() {
    noStroke();
    fill(colours[9]);
    textAlign(CENTER);
    textSize(10);
    text(gateTypeText[type], pos.x, pos.y - IOSize);
  }

  // #endregion


  // #region - Calculation

  void calculateOutput() {
    if (manualIn) {
      out = true;
    } else {
      out = false;

      switch (type) {
      case 0:
        for (int i = 0; i < in.size(); i++) { // OR
          if (in.get(i)) {
            out = true;
          }
        }
        break;

      case 1:
        out = in.size() > 0;
        for (int i = 0; i < in.size(); i++) { // NOR
          if (in.get(i)) {
            out = false;
          }
        }
        break;

      case 2:
        for (int i = 0; i < in.size(); i++) { // XOR
          if (in.get(i)) {
            out = !out;
          }
        }
        break;

      case 3:
        out = in.size() > 0;
        for (int i = 0; i < in.size(); i++) { // AND
          if (!in.get(i)) {
            out = false;
          }
        }
        break;
      }
    }
    in.clear();
  }

  // #endregion


  // #region - Communication

  void sendOutput() {
    for (int i = 0; i < connections.size(); i++) {
      if (connections.get(i).in == this) {
        connections.get(i).sendOutput(out);
      }
    }
  }


  void recieveInput(Boolean val) {
    in.add(val);
  }

  // #endregion


  // #region - Other

  Boolean isHovered() {
    return (dist(nMouseX, nMouseY, pos.x, pos.y) < gateSize / 2);
  }

  // #endregion
}
