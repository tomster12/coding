package neat;

public class Float2 {
	
	float x, y;
	
	
	public Float2(double x_, double y_) {x = (float)x_; y = (float)y_;}
	public Float2(float x_, double y_) {x = (float)x_; y = (float)y_;}
	public Float2(double x_, float y_) {x = (float)x_; y = (float)y_;}
	public Float2(float x_, float y_) {x = x_; y = y_;}
	
	
	public void add(Float2 other) {
		x += other.x;
		y += other.y;
	}	
	
	
	public void sub(Float2 other) {
		x -= other.x;
		y -= other.y;
	}
	
	
	public void mult(double val) {
		x *= val;
		y *= val;
	}
	
	
	public void div(double val) {
		x /= val;
		y /= val;
	}


	public Float2 copy() {
		return new Float2(x, y);
	}
}
