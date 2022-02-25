class unit {


  constructor(data_, size_, unData_) {
    this.data = data_;
    this.size = size_;

    this.it = unData_[0];
    this.fitness = 0;

    this.pos = createVector(200, 200);
    this.done = false;
  }


  Update() {
    this.Show();
    this.Movement();
    this.check();
  }


  Show() {
    ellipse(this.pos.x, this.pos.y, this.size);
  }


  Movement() {
    if (!this.done) {
      this.fitness += this.data[0];
      this.data.splice(0, 1);
    }
  }


  check() {
    if (!this.done) {
      if (this.data.length == 0) {
        this.done = true;
      }
    }
  }


  GetFitness() {
    return this.fitness;
  }
}
