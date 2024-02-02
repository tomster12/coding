
class Polar {

  // #region - Setup

  public angle: number;
  public mag: number;


  constructor(angle: number, mag: number) {
    // Initialize variables
    this.angle = angle;
    this.mag = mag;
  }


  static fromVec2(oVec: Vec2): Polar {
    // Retuns a polar that is equal to a vector vector
    return new Polar(oVec.getAngle(), oVec.getMag());
  }


  set(angle: number, mag: number): Polar {
    // Set this polars variables
    this.angle = angle;
    this.mag = mag;
    return this;
  }


  copy(): Polar {
    // Returns a copy of this polar
    return new Polar(this.angle, this.mag);
  }


  angleTo(oPolar: Polar): number {
    let potentialAngles = [
      oPolar.angle - this.angle,
      (oPolar.angle + TWO_PI) - this.angle,
      oPolar.angle - (this.angle + TWO_PI),
    ];
    let smallest = potentialAngles[0];
    for (let angle of potentialAngles)
      if (abs(angle) < abs(smallest)) smallest = angle;
    return smallest;
  }


  polarTo(oPolar: Polar) {
    // Returns a polar this is difference between this and oPolar
    let smallest = this.angleTo(oPolar);
    return new Polar(smallest, oPolar.mag - this.mag);
  }

  // #endregion


  // #region - Mutable

  ipAddAngle(angle: number): Polar {
    // Add an angle to this polars angle
    this.angle += angle;
    return this;
  }


  ipAdd(oPolar: Polar): Polar {
    // Add a polar to this polar
    this.angle += oPolar.angle;
    this.mag += oPolar.mag;
    return this;
  }


  ipSub(oPolar: Polar): Polar {
    // Sub a polar from this polar
    this.angle -= oPolar.angle;
    this.mag -= oPolar.mag;
    return this;
  }


  ipMult(val: number): Polar {
    // Multiply the angle and mag by val
    this.angle *= val;
    this.mag *= val;
    return this;
  }

  // #endregion


  // #region - Immutable

    addAngle(angle: number): Polar {
      // Returns a copy with the angle added
      let newPolar = this.copy();
      return newPolar.ipAddAngle(angle);
    }


    add(oPolar: Polar): Polar {
      // Returns a copy added to oPolar
      let newPolar = this.copy();
      return newPolar.ipAdd(oPolar);
    }


    sub(oPolar: Polar): Polar {
      // Returns a copy subbed to oPolar
      let newPolar = this.copy();
      return newPolar.ipSub(oPolar);
    }


    mult(val: number): Polar {
      // Returns a copy subbed to oPolar
      let newPolar = this.copy();
      return newPolar.ipMult(val);
    }

    // #endregion
}
