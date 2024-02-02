class unit {


  constructor(data_, size_) {
    this.data = data_;
    this.size = size_;

    this.visualAnglesRaw = visualAngles;
    this.visualDistance = visualDistance;
    this.visualIntervals = visualIntervals;
    this.fitnessInterval = fitnessInterval;
    this.fitness = baseFitness;
    this.speed = speed;
    this.visualAngles = [0, 0, 0, 0, 0];
    this.visualOut = [false, false, false, false, false];
    this.angle = random(0, 360);

    this.pos = createVector(random(50, width - 50), random(50, height - 50));
    this.done = false;
  }



  Update() {
    this.Show();
    for (let i = 0; i < updatePerFrame; i++) {
      this.Movement();
      this.check();
    }
  }


  Show() {
    // this.visual();
    stroke(0, 0, 0);
    strokeWeight(1);

    if (this.done) {
      fill(100);
    } else {
      fill(100, 200, 100);
    }
    ellipse(this.pos.x, this.pos.y, this.size * 2);
  }


  visual() {
    for (let i = 0; i < this.visualAngles.length; i++) {
      let rad = radians(this.visualAngles[i]) - PI / 2;
      let x = this.pos.x + cos(rad) * (this.visualDistance + this.size);
      let y = this.pos.y + sin(rad) * (this.visualDistance + this.size);
      strokeWeight(2);
      noFill();
      if (this.visualOut[i]) {
        stroke(100, 150, 100, 175);
      } else {
        stroke(150, 100, 100, 175);
      }
      line(this.pos.x, this.pos.y, x, y);
    }
  }


  Movement() {
    if (!this.done) {
      this.visualCalc();
      let netIn = this.visualOut.slice();
      netIn = netIn.map(v => (v ? 1 : 0));
      let out = this.data.Propogate(netIn);

      this.pos.add(createVector(sin(radians(this.angle) + PI) * this.speed, cos(radians(this.angle) + PI)* this.speed));
      if (out[0] > 0.8) {
        this.angle -= speed * 2;
      }
      if (out[1] > 0.8) {
        this.angle += speed * 2;
      }
    }
  }


  visualCalc() {
    this.visualOut = [false, false, false, false, false, false, false];
    for (let i = 0; i < this.visualAnglesRaw.length; i++) {
      this.visualAngles[i] = this.visualAnglesRaw[i] - this.angle;
    }
    for (let i = 0; i < this.visualAngles.length; i++) {
      for (let d = this.visualDistance / this.visualIntervals; d <= this.visualDistance; d += this.visualDistance / this.visualIntervals) {
        let rad = radians(this.visualAngles[i]) - PI / 2;
        let x = this.pos.x + cos(rad) * (d + this.size);
        let y = this.pos.y + sin(rad) * (d + this.size);
        if (debug) {
          fill(100, 100, 100, 175);
          noStroke()
          ellipse(x, y, 5);
        }
        for (let o = 0; o < foods.length; o++) {
          if (createVector(x, y).dist(foods[o].pos) < foods[o].size) {
            this.visualOut[i] = true;
          }
        }
      }
    }
  }


  check() {
    if (!this.done) {
      this.eatCheck();
      if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
        this.done = true;
      }
      if (this.fitness < 0) {
        this.done = true;
      }
    }
  }


  eatCheck() {
    if (frameCount % (60 * this.fitnessInterval) == 0) {
      this.fitness--;
    }
    for (let i = 0; i < foods.length; i++) {
      if (this.pos.dist(foods[i].pos) < (this.size + foods[i].size)) {
        this.eat(foods[i]);
      }
    }
  }


  eat(food) {
    this.fitness += food.score;
    foods.splice(foods.indexOf(food), 1);
  }


  GetFitness() {
    return this.fitness;
  }
}
