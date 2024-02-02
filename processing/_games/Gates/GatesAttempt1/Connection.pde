

class Connection {
  // #region - Setup

  PVector startPos;
  PVector endPos;
  Boolean selected;

  Gate in;
  Gate out;


  Connection(Gate in_) {
    in = in_;
    selected = false;
  }


  Connection(Gate in_, Gate out_) {
    in = in_;
    out = out_;
    selected = false;
  }

  // #endregion


  // #region - Main

  void update() {
    updatePos();
    drawConnection();
  }


  void updatePos() {
    PVector ip = in.pos;
    startPos = ip.copy();

    // If selected go to mouse
    if (selected) {
      endPos = new PVector(nMouseX, nMouseY);

    // If no out gate go to start pos
    } else if (!selected) {
      if (out == null) {
        endPos = in.pos.copy();

      // If out gate go to gate pos
      } else {
        PVector vec1 = out.pos.copy() .sub(in.pos);
        PVector vec2 = in.pos.copy() .sub(out.pos) .normalize() .mult(gateSize * 0.5);
        endPos = in.pos.copy() .add(vec1) .add(vec2);
      }
    }
  }


  void drawConnection() {
    stroke(colours[6]);
    strokeWeight(strokeWeights[2]);
    line(startPos.x, startPos.y, endPos.x, endPos.y);

    stroke(colours[7]);
    strokeWeight(strokeWeights[3]);
    fill(in.out ? colours[1] : colours[2]);
    ellipse(endPos.x, endPos.y, IOSize, IOSize);
  }

  // #endregion


  // #region - Communication

  void sendOutput(Boolean val) {
    if (out != null) {
      out.recieveInput(val);
    }
  }

  // #endregion


  // #region - Other

  Boolean isHovered() {
    return (dist(nMouseX, nMouseY, endPos.x, endPos.y) < IOSize / 2);
  }

  // #endregion
}
