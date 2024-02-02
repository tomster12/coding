package main;

import java.util.ArrayList;

import processing.core.PApplet;
import processing.core.PVector;

public class FourierTransform extends PApplet {

	// Global Variables
	PVector centre;
	ArrayList<PVector> drawPath;
	ArrayList<PVector> showPath;
	Complex[] fourierX;
	float fourierTime;


	// Main functions
	public static void main(String[] args) {
		PApplet.main("main.FourierTransform");
	}


	// PApplet settings
	public void settings() {
		size(800, 600);
	}


	// PApplet setup
	public void setup() {
	textAlign(CENTER);
		centre = new PVector(width/2, height/2);
		drawPath = new ArrayList<PVector>();
		showPath = new ArrayList<PVector>();
	}


	// PApplet draw
	public void draw() {
	  background(0);
	  stroke(255);

	  // Update and show draw path
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


	// Draw the current fourier transform
	public void drawOutput() {
	stroke(200, 100);
	noFill();
	fourierTime++;
	PVector pp = centre.copy();

	  // For each frequency
		float prevX = 10;
		float prevY = height-10;
		for (float k = 0; k < fourierX.length; k++) {
			Complex z = fourierX[(int)k];
			z.updateValues();

	    // Draw epicycle - cos/sin (2PIft + phase)
			PVector cp = new PVector(
				pp.x + z.mag*cos(TWO_PI * z.freq * fourierTime + z.phase),
				pp.y + -z.mag*sin(TWO_PI * z.freq * fourierTime + z.phase)
			);
		    ellipse(pp.x, pp.y, z.mag*2, z.mag*2);
		    line(pp.x, pp.y, cp.x, cp.y);
		    pp = cp.copy();


	    // Draw raw fourier transform
		    float nx = map(k, 0, fourierX.length, 10, width-10);
		    float ny = height-10 -z.mag;
		    line(prevX, prevY, nx, ny);
		    prevX = nx;
		    prevY = ny;
		}

	  // Output show path
		stroke(255);
		if (fourierTime < fourierX.length) showPath.add(0, pp.copy());
  		for (int i = 0; i < showPath.size()-1; i++) {
  			PVector p1 = showPath.get(i);
  			PVector p2 = showPath.get(i+1);
  			line(p1.x, p1.y, p2.x, p2.y);
  		}
	}


	Complex[] dft(Complex[] x) {
	  Complex[] out = new Complex[x.length];

	  // For each k
	  for (int k = 0; k < x.length; k++) {
		    Complex sum = new Complex(0, 0);
		    sum.freq = 1.0f * k / x.length; // (frequency = sampleRate * k / N)

	    // Get average point of x wrapped around complex unit circe
		    for (int n = 0; n < x.length; n++) {
		    	float phi = TWO_PI * sum.freq * n; // frequency - 2PIft
		    	Complex nz = new Complex(
		    		cos(phi),
				    -sin(phi)
		    	);
		    	nz.mult(x[n]);
		    	sum.add(nz);
		    }

	    // Correct average calculation and output
		    sum.r /= x.length;
		    sum.c /= x.length;
		    out[k] = sum;
	  }
	  return out;
	}


	// Sort a fourier transform
	Complex[] fourierSort(Complex[] x) {
		int n = x.length;
		Complex[] nx = new Complex[n];

	  // Get new list of updated complex values
		for (int i = 0; i < n; i++) {
			nx[i] = x[i].copy();
			nx[i].updateValues();
		}

	  // Insertion sort biggest-smallest
		for (int i = 0; i < n-1; i++) {
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


	// PApplet inputs
	public void mousePressed() {
		fourierReset();
	}
	public void mouseReleased() {
		fourierSet(drawPath);
	}


	// Reset current fourier values
	public void fourierReset() {
	  fourierX = null;
	  drawPath.clear();
	  showPath.clear();
	}


	// Turn PVector values to complex numbers relative to center, set to fourierX
	public void fourierSet(ArrayList<PVector> path) {
		  fourierTime = 0;
		  Complex[] x = new Complex[path.size()];
		  for (int i = 0; i < path.size(); i++) {
			    PVector p = path.get(i);
			    x[i] = new Complex(p.x - centre.x, centre.y - p.y);
		  }

		  fourierX = dft(x); // Get discrete fourier transform of values and sort
		  fourierX = fourierSort(fourierX);
	}
}
