
class Graph {

  static BACKGROUND_COLOR = "#dfdfdf";


  constructor(pos_, size_) {
    this.pos = pos_ || { x: 0, y: 0 };
    this.size = size_ || { x: 0, y: 0 };
    this.axis = [ 0, 2 ];
    this.values = [];
  }


  update() {}


  show() {
    // Draw background with border
    let border = 10;
    rectMode(CENTER);
    fill(Graph.BACKGROUND_COLOR);
    rect( this.pos.x, this.pos.y, this.size.x, this.size.y );

    // Draw axis
    let topY = this.pos.y - this.size.x * 0.5 + border;
    let bottomY = this.pos.y + this.size.y * 0.5 - border;
    let startX = this.pos.x - this.size.x * 0.5 + border;
    let endX = this.pos.x + this.size.x * 0.5 - border;

    stroke(0);
    line(startX, topY, startX, bottomY);
    line(startX, bottomY, endX, bottomY);

    // Draw values
    for (let i = 0; i < this.values.length - 1; i++) {
      let currentX = map(i, 0, this.values.length - 2, startX, endX);
      let currentY = max(map(this.values[i], this.axis[0], this.axis[1], bottomY, topY), topY);
      let nextX = map(i + 1, 0, this.values.length - 2, startX, endX);
      let nextY = max(map(this.values[i + 1], this.axis[0], this.axis[1], bottomY, topY), topY);
      line(currentX, currentY, nextX, nextY);
    }
  }


  setPos(x, y) { this.pos.x = x; this.pos.y = y; }

  setSize(x, y) { this.size.x = x; this.size.y = y; }

  setAxis(axis) { this.axis = axis; }

  setValues(values) { this.values = values; }
}