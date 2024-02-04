

function MakeFood() {
  for (let i = 0; i < foodAmount; i++) {
    foods.push(new food(createVector(random(0, width), random(0, height)), foodSize));
  }
}


// ---------------------------------------------------------------------


class food {
  constructor(pos_) {
    this.pos = pos_;
    this.size = foodSize;
    this.score = this.size;
  }


  // ---------------------------------------------------------------------


  update() {
    this.show();
  }


  // ---------------------------------------------------------------------


  show() {
    noStroke();
    fill(100, 180, 100);
    ellipse(this.pos.x, this.pos.y, this.size * 2);
  }
}
