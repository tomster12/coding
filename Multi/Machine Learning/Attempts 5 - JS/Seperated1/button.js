
class Button {

  // Declare static variables
  static OUTLINE_COLOR = "#1d1d1f";
  static BACKGROUND_COLOR = "#777785";
  static HOVER_COLOR = "#848491";


  constructor(px, py, sx, sy, clicked, held) {
    // Initialize variables
    this.pos = { x: px, y: py };
    this.size = { x: sx, y: sy };
    this.clicked = clicked || (() => {});
    this.held = held || (() => {});
  }


  update(view, interactable) {
    // Check whether being clicked / held on
    if (interactable && this.mouseOntop(view)) {
      if (input.mouse.clicked[LEFT]) this.clicked();
      if (input.mouse.held[LEFT]) this.held();
    }
  }


  show(view) {
    // Draw button as box
    view.getOutput().strokeWeight(1);
    view.getOutput().stroke(Button.OUTLINE_COLOR);
    if (this.mouseOntop(view)) view.getOutput().fill(Button.HOVER_COLOR);
    else view.getOutput().fill(Button.BACKGROUND_COLOR);
    view.getOutput().rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }


  mouseOntop(view) {
    // Check whether mouse is ontop
    return (
      view.getMouseX() > (this.pos.x)
      && view.getMouseX() <= (this.pos.x + this.size.x)
      && view.getMouseY() > (this.pos.y)
      && view.getMouseY() <= (this.pos.y + this.size.y)
    );
  }
}