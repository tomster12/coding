
class ViewManager {

  constructor() {
    // Initialize variables
    this.views = [];
  }


  draw() {
    // Update and draw all views
    for (let view of this.views) view.update();
    for (let view of this.views) view.show();
  }


  // Create and add the given view
  createView(x, y, sx, sy) {
    let view = new View(x, y, sx, sy);
    this.views.push(view);
    return view;
  }
}


class View {

  // Declare static variables
  static BAR_SIZE = 15;
  static CORNER_CLEARANCE = 15;
  static TAB_SIZE = 50;
  static OUTLINE_COLOR = "#1d1d1f";
  static BAR_COLOR = "#777785";
  static HOVER_COLOR = "#848491";
  static BACKGROUND_COLOR = "#37383d";


  constructor(x, y) {
    // Initialize variables
    this.pos = { x: x, y: y };
    this.size = { x: 50, y: 50 };
    this.output = createGraphics(50, 50);
    this.output.noSmooth();

    this.tabs = [];
    this.selectedTab = -1;
    this.dragging = false;
    this.resizing = false;
    this.mouseOffset = { x: 0, y: 0 };
  }


  update() {
    this.handleInput();
    this.updateVisual();

    // Update all tabs
    for (let i = 0; i < this.tabs.length; i++) {
      let interactable = this.selectedTab == i;
      this.tabs[i].inner.update(this, interactable);
    }
  }


  handleInput() {
    if (input.mouse.clicked[LEFT]) {

      // Check whether lmb on corner
      if (this.mouseOverCorner()) {
        this.resizing = true;
        this.mouseOffset = { x: this.pos.x + this.size.x - mouseX, y: this.pos.y + this.size.y - mouseY };

      // Check whether lmb on top bar
      } else if (this.mouseOverBar()) {
        this.dragging = true;
        this.mouseOffset = { x: this.pos.x - mouseX, y: this.pos.y - mouseY };

        // Check whether lmb over any tabs
        for (let i = 0; i < this.tabs.length; i++) {
          if (this.mouseOverTab(i)) this.selectTab(i);
        }
      }

    // Stop variables on mouse up
    } else if (!input.mouse.held[LEFT]) {
      this.dragging = false;
      this.resizing = false;
    }
  }


  updateVisual() {
    // Update position if dragging
    if (this.dragging) {
      this.pos.x = mouseX + this.mouseOffset.x;
      this.pos.y = mouseY + this.mouseOffset.y;

    // Update size if resizing
    } else if (this.resizing) {
      this.size.x = (mouseX + this.mouseOffset.x) - this.pos.x;
      this.size.y = (mouseY + this.mouseOffset.y) - this.pos.y;
      let tab = this.getCurrentTab();
      if (tab != null) {
        tab.size.x = this.size.x;
        tab.size.y = this.size.y;
      }
      this.output = createGraphics(this.size.x, this.size.y);
    }
  }


  show() {
    // Draw tab inner to output if there are any
    this.output.background(View.BACKGROUND_COLOR);
    if (this.tabs.length != 0) this.getCurrentTab().inner.show(this);

    // Draw graphics
    image(this.output, this.pos.x, this.pos.y);

    // Draw top border
    stroke(View.OUTLINE_COLOR);
    if (this.mouseOverBar()) fill(View.HOVER_COLOR);
    else fill(View.BAR_COLOR);
    rect(this.pos.x, this.pos.y - View.BAR_SIZE, this.size.x, View.BAR_SIZE);

    // Draw all tabs
    for (let i = 0; i < this.tabs.length; i++) {
      let tab = this.getTabInfo(i);
      stroke(View.OUTLINE_COLOR);
      if (this.mouseOverTab(i)
      || this.selectedTab == i) fill(View.HOVER_COLOR);
      else fill(View.BAR_COLOR);
      rect(tab.px, tab.py, tab.sx, tab.sy);
    }

    // Draw outline
    noFill();
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    // Draw resize grab
    if (this.mouseOntop()) {
      stroke(View.OUTLINE_COLOR);
      if (this.mouseOverCorner()) fill(View.HOVER_COLOR);
      else fill(View.BAR_COLOR);
      rect(
        this.pos.x + this.size.x - View.CORNER_CLEARANCE,
        this.pos.y + this.size.y - View.CORNER_CLEARANCE,
        View.CORNER_CLEARANCE, View.CORNER_CLEARANCE
      );
    }
  }


  addTab(inner, sx, sy) {
    // Add tab and select if first
    this.tabs.push({ inner: inner, size: { x: sx, y: sy } });
    if (this.tabs.length == 1) this.selectTab(0);
  }


  selectTab(index) {
    // Select tab and update size
    this.selectedTab = index;
    let tab = this.tabs[this.selectedTab];
    this.size.x = tab.size.x;
    this.size.y = tab.size.y;
    this.output = createGraphics(this.size.x, this.size.y);
  }


  getCurrentTab() {
    // Return current tab if index in range
    if (this.tabs.length != 0) {
      return this.tabs[this.selectedTab];
    }
  }


  getTabInfo(index) {
    // Get and then return tab position / size
    let sx = View.TAB_SIZE * 0.9;
    let sy = View.BAR_SIZE * 0.85;
    let px = this.pos.x + index * View.TAB_SIZE;
    let py = this.pos.y - sy;
    return { px, py, sx, sy };
  }


  mouseOntop() {
    // Check whether mouse is ontop at all
    return (
      mouseX > this.pos.x
      && mouseX <= (this.pos.x + this.size.x)
      && mouseY > this.pos.y
      && mouseY <= (this.pos.y + this.size.y)
    );
  }


  mouseOverBar() {
    // Check whether mouse is hovered over top bar
    return (
      mouseX > this.pos.x
      && mouseX <= (this.pos.x + this.size.x)
      && mouseY > (this.pos.y - View.BAR_SIZE)
      && mouseY <= this.pos.y
    );
  }


  mouseOverCorner() {
    // Check whether mouse is hovered over bottom right corner
    return (
      mouseX > (this.pos.x + this.size.x - View.CORNER_CLEARANCE)
      && mouseX < (this.pos.x + this.size.x)
      && mouseY > (this.pos.y + this.size.y - View.CORNER_CLEARANCE)
      && mouseY < (this.pos.y + this.size.y)
    );
  }


  mouseOverTab(index) {
    // Check if the mouse is overtop the tab
    let tab = this.getTabInfo(index);
    return (
      mouseX > tab.px
      && mouseX <= (tab.px + tab.sx)
      && mouseY > tab.py
      && mouseY <= (tab.py + tab.sy)
    );
  }


  // Getters for various inner requirements
  getMouseX() { return mouseX - this.pos.x; }
  getMouseY() { return mouseY - this.pos.y; }
  getOutput() { return this.output; }
}