
static class Float2 {

  public float x, y;
  public boolean magCalc, magSqCalc;
  public float mag, magSq;


  Float2(float x_, float y_) {
    x = x_; y = y_;
    magCalc = false; magSqCalc = false;
  }


  public Float2 add(Float2 other) {
    return new Float2( x + other.x, y + other.y );
  }

  public Float2 sub(Float2 other) {
    return new Float2( x - other.x, y - other.y );
  }

  public Float2 mult(float val) {
    return new Float2( x * val, y * val );
  }

  public Float2 div(float val) {
    return new Float2( x / val, y / val );
  }


  public Float2 iadd(Float2 other) {
    magCalc = false; magSqCalc = false;
    x += other.x; y += other.y;
    return this;
  }

  public Float2 isub(Float2 other) {
    magCalc = false; magSqCalc = false;
    x -= other.x; y -= other.y;
    return this;
  }

  public Float2 imult(float val) {
    magCalc = false; magSqCalc = false;
    x *= val; y *= val;
    return this;
  }

  public Float2 idiv(float val) {
    magCalc = false; magSqCalc = false;
    x /= val; y /= val;
    return this;
  }


  public Float2 normalize() {
    float cmag = mag();
    return new Float2( x / cmag, y / cmag );
  }

  public Float2 inormalize() {
    magCalc = false; magSqCalc = false;
    float cmag = mag();
    x = x / cmag; y = y / cmag;
    return this;
  }

  public float dot(Float2 other) {
    return x * other.x + y * other.y;
  }

  public Float2 transpose() {
    return new Float2( -y, x );
  }

  public float magSq() {
    if (magSqCalc) return magSq;
    magSq = x * x + y * y;
    magSqCalc = true;
    return magSq;
  }

  public float mag() {
    if (magCalc) return mag;
    if (!magSqCalc) magSq();
    mag = sqrt(magSq);
    magCalc = true;
    return mag;
  }
}