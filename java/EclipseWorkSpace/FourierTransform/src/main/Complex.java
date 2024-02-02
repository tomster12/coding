package main;

public class Complex {

	  float r;
	  float c;
	  float freq;
	  float mag;
	  float phase;

	  
	  Complex(float r_, float c_) {
	    r = r_;
	    c = c_;
	  }


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
	    mag = (float)Math.sqrt(r*r + c*c);
	    phase = (float)Math.atan2(c, r);
	  }


	  Complex copy() {
	    Complex z = new Complex(r, c);
	    z.freq = freq;
	    z.mag = mag;
	    z.phase = phase;
	    return z;
	  }
	  
}
