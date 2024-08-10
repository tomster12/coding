
// #region - Setup

// TODO: Figure out why it doesnt work anymore
float sampleRate = 60.0; // TODO: This is temporary as not sure where actual value went
PVector centre;
ArrayList<PVector> drawPath;
ArrayList<PVector> showPath;
Complex[] fourierX;
float fourierTime;


void setup() {
  size(800, 600);
  textAlign(CENTER);
  setupVariables();
}


void setupVariables() {
  centre = new PVector(width/2, height/2);
  drawPath = new ArrayList<PVector>();
  showPath = new ArrayList<PVector>();
}

// #endregion


// #region - Main

void draw() {
  background(0);
  stroke(255);

  if (mousePressed) drawPath.add(new PVector(mouseX, mouseY));
  if (fourierX == null) {
    if (drawPath != null) {
      for (int i = 0; i < drawPath.size()-1; i++) {
        PVector p1 = drawPath.get(i);
        PVector p2 = drawPath.get(i+1);
        line(p1.x, p1.y, p2.x, p2.y);
      }
    }

  } else {
    drawOutput();
  }
}


void drawOutput() {
  stroke(200, 100);
  noFill();
  fourierTime++;
  PVector pp = centre.copy();

  float prevX = 10;
  float prevY = height-10;
  for (float k = 0; k < fourierX.length; k++) { // For each frequency
    Complex z = fourierX[(int)k];
    z.updateValues();


    PVector cp = new PVector(
      pp.x + z.mag*cos(TWO_PI * z.freq * fourierTime + z.phase), // Draw epicycle - cos/sin (2PIft + phase)
      pp.y + -z.mag*sin(TWO_PI * z.freq * fourierTime + z.phase)
    );
    ellipse(pp.x, pp.y, z.mag*2, z.mag*2);
    line(pp.x, pp.y, cp.x, cp.y);
    pp = cp.copy();


    float nx = map(k, 0, fourierX.length, 10, width-10); // Draw dft
    float ny = height-10 -z.mag;
    line(prevX, prevY, nx, ny);
    prevX = nx;
    prevY = ny;
  }

  stroke(255);
  if (fourierTime < fourierX.length) showPath.add(0, pp.copy()); // Update and draw show path
  for (int i = 0; i < showPath.size()-1; i++) {
    PVector p1 = showPath.get(i);
    PVector p2 = showPath.get(i+1);
    line(p1.x, p1.y, p2.x, p2.y);
  }

  text(sampleRate, 300, 10);
}


Complex[] dft(Complex[] x) {
  Complex[] out = new Complex[x.length];
  for (int k = 0; k < x.length; k++) { // For every k
    Complex sum = new Complex(0, 0);
    sum.freq = sampleRate * k / x.length; // (frequency = sampleRate * k / N)

    for (int n = 0; n < x.length; n++) {
      float phi = TWO_PI * sum.freq * n; //  Wrap the function around at the frequency (2PIft)
      Complex nz = new Complex(cos(phi), -sin(phi));
      nz.mult(x[n]);
      sum.add(nz); // Add to sum
    }

    sum.r /= x.length;
    sum.c /= x.length; // And find the average of all the sum
    out[k] = sum;
  }
  return out;
}


Complex[] fourierSort(Complex[] x) {
  int n = x.length;
  Complex[] nx = new Complex[n];
  for (int i = 0; i < n; i++) { // Get new list of updated complex values
    nx[i] = x[i].copy();
    nx[i].updateValues();
  }
  for (int i = 0; i < n-1; i++) { // Insertion sort biggest-smallest
    int bInd = i;
    float bVal = nx[i].mag;

    for (int o = i+1; o < n; o++) {
      if (nx[o].mag > bVal) {
        bInd = o;
        bVal = nx[o].mag;
      }
    }
    Complex t = nx[i].copy();
    nx[i] = nx[bInd].copy();
    nx[bInd] = t;
  }
  return nx;
}

// #endregion


// #region - Input

void mousePressed() {
  fourierReset();
}


void mouseReleased() {
  fourierSet(drawPath);
}


void fourierReset() {
  fourierX = null;
  drawPath.clear();
  showPath.clear();
}


void fourierSet(ArrayList<PVector> path) {
  fourierTime = 0;
  Complex[] x = new Complex[path.size()];
  for (int i = 0; i < path.size(); i++) { // Turn pvector values to complex numbers relative to center
    PVector p = path.get(i);
    x[i] = new Complex(p.x - centre.x, centre.y - p.y);
  }

  fourierX = dft(x); // Get discrete fourier transform of values and sort
  fourierX = fourierSort(fourierX);
}

// #endregion


class Complex {

  // #region - Setup

  float r;
  float c;
  float freq;
  float mag;
  float phase;

  Complex(float r_, float c_) {
    r = r_;
    c = c_;
  }

  // #endregion


  // #region - Main

  void mult(Complex z) {
    float nr = r*z.r - c*z.c;
    float nc = r*z.c + c*z.r;
    r = nr;
    c = nc;
  }


  void add(Complex z) {
    r += z.r;
    c += z.c;
  }


  void updateValues() {
    mag = sqrt(r*r + c*c);
    phase = atan2(c, r);
  }


  Complex copy() {
    Complex z = new Complex(r, c);
    z.freq = freq;
    z.mag = mag;
    z.phase = phase;
    return z;
  }

  // #endregion
}
