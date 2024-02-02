
class UI { }

UI.TextInput = class {

  // #region - Main

  constructor(pos_, size_) {
    // Initialize variables
    this.pos = pos_;
    this.size = size_;
    this.border = this.size.y * 0.3;
    this.textSize = (this.size.y - this.border * 2) * 1.2;

    this.output = createGraphics(this.size.x, this.size.y);
    this.focused = false;
    this.text = "";
    this.cursorTimer = [0, 60];
    this.deleteTimer = [0, 20, 0, 4];
  }


  update() {
    // Update focused
    if (input.mouse.clicked.left) {
      if (this.hovered()) this.focus();
      else this.unfocus();

    // Delete all
    } else if (input.mouse.clicked.right) {
      if (this.hovered()) this.text = "";
    }

    // Holding delete
    if (this.focused) {
      if (input.keys.held[8]) {
        if (this.deleteTimer[0] < this.deleteTimer[1]) this.deleteTimer[0] += 1;
        else {
          if (this.deleteTimer[2] == 0) this.text = this.text.substring(0, this.text.length - 1);
          this.deleteTimer[2] = (this.deleteTimer[2] + 1) % this.deleteTimer[3];
        }
      } else {
        this.deleteTimer[0] = 0;
        this.deleteTimer[2] = 0;
      }

      // Pressing delete
      for (let [k, v] of Object.entries(input.keys.clicked)) {
        if (k == 8) this.text = this.text.substring(0, this.text.length - 1);

        // Pressing button
        else {
          let out = (String.fromCharCode(k)).toLowerCase();
          if (input.keys.held[16]) out = out.toUpperCase();
          this.text += out;
        }
      }
    }

    // update focused cursor
    if (this.focused)
      this.cursorTimer[0] = (this.cursorTimer[0] + this.cursorTimer[1] - 1) % this.cursorTimer[1];
  }


  show() {
    // Show background
    this.output.background(this.hovered() ? "#f0f0f0" : "#ebebeb");

    // Add focused cursor
    let outText = this.text;
    if (this.focused && this.cursorTimer[0] > (this.cursorTimer[1] / 2))
      outText += "_";
    else outText += "  ";

    // Show text input
    this.output.noStroke();
    this.output.fill("#444444");
    this.output.textSize(this.textSize);
    if (this.output.textWidth(outText) > (this.size.x - this.border * 2)) {
      this.output.textAlign(RIGHT);
      this.output.text(outText, this.size.x - this.border, this.size.y - this.border);
    } else {
      this.output.textAlign(LEFT);
      this.output.text(outText, this.border, this.size.y - this.border);
    }
    image(this.output.get(0, 0, this.size.x, this.size.y),
      this.pos.x, this.pos.y, this.size.x, this.size.y);
  }


  focus() {
    // Focus this UI element
    this.focused = true;
    this.cursorTimer[0] = this.cursorTimer[1];
  }


  unfocus() {
    // Unfocus this UI element
    this.focused = false;
  }


  hovered() {
    // Return whether hovered
    return mouseX > this.pos.x
      && mouseX < (this.pos.x + this.size.x)
      && mouseY > this.pos.y
      && mouseY < (this.pos.y + this.size.y);
  }

  // #endregion
}