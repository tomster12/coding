
// Declare variables
let outputs;
let pi;


function preload() {
  // Load pi coordinates
  table = loadTable("pi.csv", "csv");
}


function setup() {
  createCanvas(950, 650);

  // Initialize variables
  outputs = [];

  // 1D DFT / IDFT
  outputs.push(new Signal1D(
    50, 50, 250, 250,
    { x: [ 0, 2 ], y: [ -2, 2 ] },
    t => {
      let s1 = sin(TWO_PI * 2 * t);
      let s2 = 0.6 * sin((2.0 + sin(frameCount * 0.01) * 0.5) * t * TWO_PI);
      let s3 = 0.2 * cos(5.0 * t * TWO_PI + 1.0);
      return s2 + s3;
    }, 64, true
));
  outputs.push(new Signal1DToFrequency1D(
  350, 50, 250, 250,
  { y: [ -5, 80 ] },
  outputs[outputs.length - 1]
));
  outputs.push(new Frequency1DToSignal1D(
  650, 50, 250, 250,
  { x: [ 0, 2 ], y: [ -2, 2 ] },
  outputs[outputs.length - 1]
));

  // 2D DFT
  outputs.push(new Signal2D(
    50, 350, 250, 250,
    { x: [ -400, 400 ], y: [ -400, 400 ] },
    table
  ));
  outputs.push(new Signal2DToFrequency1D(
    350, 350, 250, 250,
    { y: [ -5, 80 ] },
    outputs[outputs.length - 1]
  ));

  // 2D IDFT or 2D Epicycles
  if (false) outputs.push(new Frequency1DToSignal2D(
      650, 350, 250, 250,
      { x: [ -1, 1 ], y: [ -1, 1 ] },
      outputs[outputs.length - 1]
    ));
  else outputs.push(new Signal2DToEpicycle2D(
      650, 350, 250, 250,
      { x: [ -400, 400 ], y: [ -400, 400 ] },
      outputs[outputs.length - 2]
    ));
}


function draw() {
  background(0);

  // Update and draw outputs
  for (let output of outputs) output.update();
  for (let output of outputs) output.show();
}


function round2(value, dp) {
  // Round a number to set decimal places
  let num = value * pow(10, dp);
  return round(num) / pow(10, dp);
}


// #region - Helper

class Complex {

  constructor(a, b) {
    // Initialize variables
    this.a = a;
    this.b = b;

    // Calculate values
    this.mag = sqrt(this.a * this.a + this.b * this.b);
    this.phase = atan2(this.b, this.a);
  }


  sum(other) {
    // Add complex number elements
    return new Complex(
      this.a + other.a,
      this.b + other.b
    );
  }


  mult(other) {
    // Multiply 2 complex numbers
    return new Complex(
      this.a * other.a - this.b * other.b,
      this.a * other.b + this.b * other.a
    );
  }


  scale(val) {
    // Scale this complex by a real
    return new Complex(
      this.a * val,
      this.b * val
    );
  }
}


class Fourier {

  static dft(x, N, k) {
    // Intialize target frequency X[k]
    let Xk = new Complex(0, 0);

    // For each discrete signal x[n]
    for (let n = 0; n < N; n++) {

      // Add to total amount that X[k] is affected by x[n]
      let phi = TWO_PI * n * k / N;
      let signal = new Complex(cos(phi), -sin(phi));
      Xk = Xk.sum(x[n].mult(signal));
    }

    // Return total weighting of frequency X[k] across all x[n]
    return Xk;
  }


  static idft(X, N, n) {
    // Initialize target signal x[n]
    let xn = new Complex(0, 0);

    // For each discrete frequency X[k]
    for (let k = 0; k < N; k++) {

      // Add to total amount that x[n] is affected by X[k]
      let shiftedK = (k + N / 2);
      let phi = TWO_PI * n * shiftedK / N;
      let signal = new Complex(cos(phi), sin(phi));
      xn = xn.sum(X[k].mult(signal));
    }

    // Return final Average Value
    return xn.scale(1 / N);
  }
}


class Output {

  constructor(name_, px, py, sx, sy, axis_) {
    // Initialize variables
    this.name = name_;
    this.pos = { x: px, y: py };
    this.size = { x: sx, y: sy };
    this.axis = axis_ || { };
    this.N = 0;
  }


  update() {}


  show() {
    // Draw outline
    noFill();
    stroke(255);
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    // Draw text
    noStroke();
    fill(255);
    if (this.axis.x != null) {
      textAlign(LEFT, BOTTOM);
      text(round2(this.axis.x[0], 2), this.pos.x + 2, this.pos.y + this.size.y * 0.5);
      textAlign(RIGHT, BOTTOM);
      text(round2(this.axis.x[1], 2), this.pos.x + this.size.x - 2, this.pos.y + this.size.y * 0.5);
    }
    if (this.axis.y != null) {
      textAlign(CENTER, TOP);
      text(round2(this.axis.y[1], 2), this.pos.x + this.size.x * 0.5, this.pos.y + 2);
      textAlign(CENTER, BOTTOM);
      text(round2(this.axis.y[0], 2), this.pos.x + this.size.x * 0.5, this.pos.y + this.size.y - 2);
    }

    // Draw name
    text(this.name, this.pos.x + this.size.x * 0.5, this.pos.y - 2);
  }


  getValue(i) {}
}


class Graph extends Output {

  constructor(name, px, py, sx, sy, axis) {
    super(name, px, py, sx, sy, axis);
  }


  show() {
    // Draw centerline
    if (this.axis.y != null) {
      let baseMult = this.axis.y[1] / (this.axis.y[1] - this.axis.y[0]);
      stroke(160);
      line(
        this.pos.x, this.pos.y + this.size.y * baseMult,
        this.pos.x + this.size.x, this.pos.y + this.size.y * baseMult);
    }

    // Draw values
    stroke(255);
    let positions = [];
    for (let i = 0; i < this.N; i++) positions.push(this.getPos(i));
    for (let i = 0; i < this.N - 1; i++) {
      line(
        positions[i].x, positions[i].y,
        positions[i + 1].x, positions[i + 1].y
      );
    }

    // Calculate hover
    if (mouseX > this.pos.x && mouseX < (this.pos.x + this.size.x)
    && mouseY > this.pos.y && mouseY < (this.pos.y + this.size.y)) {
      let spacing = this.size.x / this.N;
      let index = floor((mouseX + spacing / 2 - this.pos.x) / spacing);

      // Draw indicator
      stroke(160);
      line(
        this.pos.x + index * spacing,
        this.pos.y,
        this.pos.x + index * spacing,
        this.pos.y + this.size.y
      );

      // Draw value
      if (index < this.N) {
        let xValue = this.axis.x == null ? "?" : round2(map(index, 0, this.N, this.axis.x[0], this.axis.x[1]), 2);
        let yValue = this.axis.y == null ? "?" : round2(this.getValue(index), 2);
        noStroke();
        textAlign(LEFT, BOTTOM);
        text(xValue + ", " + yValue, mouseX + 4, mouseY + 2);
      }
    }

    // Draw box and text
    super.show();
  }


  getPos(i) {
    // Return the position of a value
    return {
      x: map(i, 0, this.N, this.pos.x, this.pos.x + this.size.x),
      y: map(this.getValue(i), this.axis.y[0], this.axis.y[1], this.pos.y + this.size.y, this.pos.y)
    }
  }
}


class Path extends Output {

  constructor(name, px, py, sx, sy, axis) {
    super(name, px, py, sx, sy, axis);
  }


  show() {
    // Draw values
    stroke(255);
    let positions = [];
    for (let i = 0; i < this.N; i++) positions.push(this.getPos(i));
    for (let i = 0; i < this.N - 1; i++) {
      line(
        positions[i].x, positions[i].y,
        positions[i + 1].x, positions[i + 1].y
      );
    }

    // Draw outline and text
    super.show();
  }


  getPos(i) {
    // Return the position of a value
    return {
      x: map(this.getValue(i).a, this.axis.x[0], this.axis.x[1], this.pos.x, this.pos.x + this.size.x),
      y: map(this.getValue(i).b, this.axis.y[0], this.axis.y[1], this.pos.y + this.size.y, this.pos.y)
    }
  }
}

// #endregion


// #region - 1D

class Signal1D extends Graph {

  constructor(px, py, sx, sy, axis_, func_, N_, updateEachFrame_) {
    super("Signal Time Domain", px, py, sx, sy, axis_);

    // Initialize variables
    this.func = func_;
    this.updateEachFrame = updateEachFrame_;
    this.hasUpdated = false;

    this.N = N_;
    this.x = new Array(this.N);
    this.updateValues();
  }


  getValue(i) {
    // Get x at i
    return this.x[i].a;
  }


  update() {
    // Run update functions
    if (this.updateEachFrame) {
      this.updateValues();
      this.hasUpdated = true;
    }
  }


  updateValues() {
    // Update values
    for (let i = 0; i < this.N; i++) {
      this.x[i] = new Complex(this.func(map(i,
        0, this.N - 1,
        this.axis.x[0], this.axis.x[1]
      )), 0);
    }
  }
}


class Signal1DToFrequency1D extends Graph {

  constructor(px, py, sx, sy, axis_, signal_) {
    super("DFT Frequency Domain", px, py, sx, sy, axis_);

    // Initialize variables
    this.signal = signal_;
    this.hasUpdated = false;

    this.N = this.signal.N;
    this.X = new Array(this.N);
    this.updateValues();
  }


  getValue(i) {
    // Return magnitude of X at i
    return this.X[i].mag;
  }


  update() {
    // Run update functions
    this.hasUpdated = false;
    if (this.signal.hasUpdated) {
      this.updateValues();
      this.hasUpdated = true;
    }
  }


  updateValues() {
    // Update variables
    this.N = this.signal.N;

    // Calculate frequency resolution and update axis               // Using example:     (2s, 20 samples)
    let time = (this.signal.axis.x[1] - this.signal.axis.x[0]);     // Time start to end  (2s)
    let sampleFreq = this.N / time;                                 // Sample freq        (20 samples / 2s = 10hz)
    let freqRes = sampleFreq / this.N;                              // Frequency res      (10hz / 20 samples = 0.5hz)
    this.axis.x = [ freqRes * -this.N / 2, freqRes * this.N / 2 ];

    // Run dft over the signal values, then shift into bins
    for (let bin = 0; bin < this.N; bin++) {
      let k = bin - this.N / 2;
      this.X[bin] = Fourier.dft(this.signal.x, this.N, k);
    }
  }
}


class Frequency1DToSignal1D extends Graph {

  constructor(px, py, sx, sy, axis_, freq_) {
    super("Signal Time Domain", px, py, sx, sy, axis_);

    // Initialize variables
    this.freq = freq_;
    this.hasUpdated = false;

    this.N = this.freq.N;
    this.x = new Array(this.N);
    this.updateValues();
  }


  getValue(i) {
    // Return magnitude of X at i
    return this.x[i].a;
  }


  update() {
    // Run update functions
    this.hasUpdated = false;
    if (this.freq.hasUpdated) {
      this.updateValues();
      this.hasUpdated = true;
    }
  }


  updateValues() {
    // Update variables
    this.N = this.freq.N;

    // Run inverse dft over the frequency values shifted by half
    for (let n = 0; n < this.N; n++) {
      this.x[n] = Fourier.idft(this.freq.X, this.N, n);
    }
  }
}

// #endregion


// #region - 2D

class Signal2D extends Path {

  constructor(px, py, sx, sy, axis, table) {
    super("Drawing Time Domain", px, py, sx, sy, axis);

    // Initialize variables
    this.isDrawing = false;
    this.hasUpdated = false;

    this.N = 0;
    this.drawn = [];
    this.drawnTime = 0;
    this.x = [];
    this.xTime = 0;

    // Handle preset points
    if (table != null) {
      this.N = table.getRowCount();
      for (let i = 0; i < this.N; i++) {
        this.drawn.push(new Complex(
          float(table.getString(i, 0)),
          float(table.getString(i, 1))
        ));
      }
      this.drawnTime = 5.0;
      this.x = this.drawn;
      this.xTime = this.drawnTime;
    }
  }


  getValue(i) {
    // Get x at i
    return this.drawn[i];
  }


  update() {
    // Run update functions
    this.hasUpdated = false;
    if (mouseIsPressed
    && mouseX > this.pos.x && mouseX < (this.pos.x + this.size.x)
    && mouseY > this.pos.y && mouseY < (this.pos.y + this.size.y)) {

      // Reset drawing
      if (!this.isDrawing) {
        this.isDrawing = true;
        this.N = 0;
        this.drawn = [];
        this.drawnTime = 0;
      }

      // Increment time and add to current drawing
      this.N++;
      this.drawn.push(new Complex(
        map(mouseX, this.pos.x, this.pos.x + this.size.x, this.axis.x[0], this.axis.x[1]),
        map(mouseY, this.pos.y, this.pos.y + this.size.y, this.axis.y[1], this.axis.y[0])
      ));
      this.drawnTime += 1.0 / 60.0;

    // Stop drawing
    } else if (this.isDrawing && !mouseIsPressed) {
      this.isDrawing = false;
      this.hasUpdated = true;
      this.x = this.drawn;
      this.xTime = this.drawnTime;
    }
  }
}


class Signal2DToFrequency1D extends Graph {

  constructor(px, py, sx, sy, axis_, signal_) {
    super("DFT Frequency Domain", px, py, sx, sy, axis_);

    // Initialize variables
    this.signal = signal_;
    this.hasUpdated = false;

    this.N = this.signal.N;
    this.X = new Array(this.N);
    this.updateValues();
  }


  getValue(i) {
    // Return magnitude of X at i
    return this.X[i].mag;
  }


  update() {
    // Run update functions
    this.hasUpdated = false;
    if (this.signal.hasUpdated) {
      this.updateValues();
      this.hasUpdated = true;
    }
  }


  updateValues() {
    // Update variables
    this.N = this.signal.N;
    let maxFreq = 0;

    // Calculate frequency resolution and update axis
    let sampleFreq = this.N / this.signal.xTime;
    let freqRes = sampleFreq / this.N;
    this.axis.x = [ freqRes * -this.N / 2, freqRes * this.N / 2 ];

    // Run dft over the signal values, then shift into bins
    for (let bin = 0; bin < this.N; bin++) {
      let k = bin - this.N / 2;
      this.X[bin] = Fourier.dft(this.signal.x, this.N, k);
      maxFreq = max(this.X[bin].mag, maxFreq);
    }

    // Update axis to reflect max
    this.axis.y[1] = maxFreq * 1.25;
  }
}


class Signal2DToEpicycle2D extends Output {

  constructor(px, py, sx, sy, axis_, signal_) {
    super("Drawing Time Domain", px, py, sx, sy, axis_);

    // Initialize variables
    this.signal = signal_;
    this.t = 0.0;
    this.drawn = [];
    this.hasUpdated = false;

    this.N = this.signal.N;
    this.X = new Array(this.N);
    this.sortedX = new Array(this.N);
    this.updateValues();
  }


  update() {
    // Run update functions
    this.hasUpdated = false;
    if (this.signal.hasUpdated) {
      this.updateValues();
      this.hasUpdated = true;
    }
  }


  show() {
    // Calculate frequency resolution and current time
    let sampleFreq = this.N / this.signal.xTime;
    let freqRes = sampleFreq / this.N;
    this.t += 1.0 / 60.0;
    if (this.t > this.signal.xTime) {
      this.t = 0.0;
      this.drawn = [];
    }

    // Loop over the first 5 largest frequencies
    stroke(150);
    noFill();
    let pos = {
      x: this.pos.x + this.size.x * 0.5,
      y: this.pos.y + this.size.y * 0.5 };
    for (let i = 0; i < this.sortedX.length; i++) {
      let bin = this.sortedX[i];
      let current = this.X[bin];

      // Calculate end pos based on mag / phase
      let scl = {
        x: this.size.x / (this.N * (this.axis.x[1] - this.axis.x[0])),
        y: this.size.y / (this.N * (this.axis.y[1] - this.axis.y[0])) };
      let binFreq = sampleFreq * bin / this.N;
      if (bin > this.N / 2) binFreq = sampleFreq * (bin - this.N) / this.N;
      let end = {
        x : pos.x + scl.x * current.mag * cos(TWO_PI * binFreq * this.t + current.phase),
        y : pos.y + scl.y * current.mag * -sin(TWO_PI * binFreq * this.t + current.phase)
      };

      // Draw line and move to end pos
      line(pos.x, pos.y, end.x, end.y);
      ellipse(pos.x, pos.y, scl.x * current.mag * 2, scl.y * current.mag * 2);
      pos.x = end.x;
      pos.y = end.y;

      // Draw line
      if (i == this.sortedX.length - 1) {
        this.drawn.push(end);
      }
    }

    // Show line
    stroke(255);
    for (let i = 0; i < this.drawn.length - 1; i++) {
      line(
        this.drawn[i].x, this.drawn[i].y,
        this.drawn[i + 1].x, this.drawn[i + 1].y
      );
    }

    // Draw outline and text
    super.show();
  }


  updateValues() {
    // Update variables
    this.t = 0.0;
    this.drawn = [];
    this.N = this.signal.N;
    this.X = new Array(this.N);
    this.sortedX = new Array(this.N);

    // Calculate frequency resolution
    let sampleFreq = this.N / this.signal.xTime;
    let freqRes = sampleFreq / this.N;
    let t = (frameCount * 0.01) % TWO_PI;

    // Run dft over the signal values and place into bins
    for (let bin = 0; bin < this.N; bin++) {
      let k = bin;
      this.X[bin] = Fourier.dft(this.signal.x, this.N, k);
      this.sortedX[bin] = bin;
    }

    // Sort frequencies based on magnitude
    this.sortedX.sort((a, b) => this.X[b].mag - this.X[a].mag);
  }
}


class Frequency1DToSignal2D extends Path {

  constructor(px, py, sx, sy, axis_, freq_) {
    super(px, py, sx, sy, axis_);

    // Initialize variables
    this.freq = freq_;
    this.hasUpdated = false;

    this.N = this.freq.N;
    this.x = new Array(this.N);
    this.updateValues();
  }


  getValue(i) {
    // Return magnitude of X at i
    return this.x[i];
  }


  update() {
    // Run update functions
    this.hasUpdated = false;
    if (this.freq.hasUpdated) {
      this.updateValues();
      this.hasUpdated = true;
    }
  }


  updateValues() {
    // Update variables
    this.N = this.freq.N;

    // Run inverse dft over the frequency values shifted by half
    for (let n = 0; n < this.N; n++) {
      this.x[n] = Fourier.idft(this.freq.X, this.N, n);
    }
  }
}

// #endregion
