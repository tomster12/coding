class innovationList {
  constructor() {
    this.innovations = [];
    this.innovationNo = -1;
  }


  NewInnovation(nIn, nOut) {
    if (this.CheckInnovation(nIn, nOut)) {
      for (let i = 0; i < this.innovations.length; i++) {
        if (this.innovations[i].CheckInnovation(nIn, nOut)) {
          return this.innovations[i].no;
        }
      }

    } else {
      this.innovationNo++;
      this.innovations.push(new innovation(this.innovationNo, nIn, nOut));
      return this.innovationNo;
    }
  }


  CheckInnovation(nIn, nOut) {
    for (let i = 0; i < this.innovations.length; i++) {
      if (this.innovations[i].CheckInnovation(nIn, nOut)) {
        return true;
      }
    }
  }


  GetInnovation(inNo) {
    for (let i = 0; i < this.innovations.length; i++) {
      if (this.innovations[i].no == inNo) {
        return [this.innovations[i].nIn, this.innovations[i].nOut];
      }
    }
    return null;
  }
}


class innovation {
  constructor(no_, nIn_, nOut_) {
    this.no = no_;
    this.nIn = nIn_;
    this.nOut = nOut_;
  }


  CheckInnovation(nIn, nOut) {
    if (this.nIn == nIn && this.nOut == nOut) {
      return true;
    }
  }
}
