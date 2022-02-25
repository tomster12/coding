class Vec2 {
    constructor(x, y) {
        // Initialize variables
        this.x = x;
        this.y = y;
    }
    static fromDir(angle) {
        // Factory method returns a vector from an angle
        return new Vec2(cos(angle), sin(angle));
    }
    static fromPolar(oPolar) {
        // Returns a vec2 that is equal to the polar
        return this.fromDir(oPolar.angle).ipMult(oPolar.mag);
    }
    set(x, y) {
        // Set the values of this vector
        if (x)
            this.x = x;
        if (y)
            this.y = y;
    }
    copy() {
        // Returns a copy of this vector
        return new Vec2(this.x, this.y);
    }
    getMagSq() {
        // Return magnitude squared
        return (this.x * this.x + this.y * this.y);
    }
    getMag() {
        // Returns magnitude
        return sqrt(this.getMagSq());
    }
    getAngle() {
        // Returns the angle of this vector
        return (atan2(this.y, this.x) + TWO_PI) % TWO_PI;
    }
    getAngleTo(oVec) {
        // Returns the smallest angle between this vector and oVector
        let thisAngle = this.getAngle();
        let otherAngle = oVec.getAngle();
        let potentialAngles = [
            otherAngle - thisAngle,
            (otherAngle + TWO_PI) - thisAngle,
            otherAngle - (thisAngle + TWO_PI),
        ];
        let smallest = potentialAngles[0];
        for (let angle of potentialAngles)
            if (abs(angle) < abs(smallest))
                smallest = angle;
        return smallest;
    }
    // #endregion
    // #region - Mutable
    ipSetMag(mag) {
        // In-place set of this vectors magnitude
        this.ipNormalize().ipMult(mag);
        return this;
    }
    ipLimitMag(mag) {
        // In-place limitation of this vectors mag
        let curMag = this.getMag();
        if (curMag > mag)
            this.ipSetMag(mag);
        return this;
    }
    ipNormalize() {
        // In-place normalization of this vector
        let mag = this.getMag();
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }
    ipAdd(oVec) {
        // In-place add of this with other vector
        this.x += oVec.x;
        this.y += oVec.y;
        return this;
    }
    ipSub(oVec) {
        // In-place subtraction of this with other vector
        this.x -= oVec.x;
        this.y -= oVec.y;
        return this;
    }
    ipMult(value) {
        // In-place multiplication with value
        this.x *= value;
        this.y *= value;
        return this;
    }
    // #endregion
    // #region - Immutable
    setMag(mag) {
        // Returns a copy of this vector with a set magnitude
        let vec = this.copy();
        return vec.ipSetMag(mag);
    }
    limitMag(mag) {
        // Returns a copy of this vector with a limited magnitude
        let vec = this.copy();
        return vec.ipLimitMag(mag);
    }
    normalize() {
        // Returns a copy of this vector normalized
        let vec = this.copy();
        return vec.ipNormalize();
    }
    add(oVec) {
        // Returns a copy of this vector + oVector
        let vec = this.copy();
        return vec.ipAdd(oVec);
    }
    sub(oVec) {
        // Returns a copy of this vector - oVector
        let vec = this.copy();
        return vec.ipSub(oVec);
    }
    mult(value) {
        // Returns a copy of this vector normalized
        let vec = this.copy();
        return vec.ipMult(value);
    }
}
