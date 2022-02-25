class unit {


  constructor(data_, size_, sp_) {
    this.data = data_;
    this.size = size_;
    
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

    }
  }


  check() {
    if (!this.done) {

    }
  }


  GetFitness() {
    return this.fitness;
  }
}
