
class Graph {

  static BACKGROUND_COLOR = "#dfdfdf";


  constructor() {
    this.axis = [ 0, 1 ];
    this.values = [];
  }


  update() {}


  show(view) {
    // Draw background with border
    let border = 10;
    view.getOutput().fill(Graph.BACKGROUND_COLOR);
    view.getOutput().rect(
      border, border,
      view.getOutput().width - border * 2,
      view.getOutput().height - border * 2);

    // Draw axis
    let topY = border * 2;
    let bottomY = view.getOutput().height - border * 2;
    let startX = border * 2;
    let endX = view.getOutput().width - border * 2;

    view.getOutput().stroke(0);
    view.getOutput().line(startX, topY, startX, bottomY);
    view.getOutput().line(startX, bottomY, endX, bottomY);

    // Draw values
    for (let i = 0; i < this.values.length - 1; i++) {
      let currentX = map(i, 0, this.values.length - 2, startX, endX);
      let currentY = map(this.values[i], this.axis[0], this.axis[1], bottomY, topY);
      let nextX = map(i + 1, 0, this.values.length - 2, startX, endX);
      let nextY = map(this.values[i + 1], this.axis[0], this.axis[1], bottomY, topY);
      view.getOutput().line(currentX, currentY, nextX, nextY);
    }
  }


  // Setters for values / axis
  setAxis(axis) { this.axis = axis; }
  setValues(values) { this.values = values; }
}