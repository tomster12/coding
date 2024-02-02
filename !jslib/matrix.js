class Matrix2 {

  // #region - Setup

  constructor(rows, cols, ll, ul) {
    this.isMatrix2 = true;

    // Setup using paramter values
    if (Array.isArray(rows) && cols == null && ll == null && ul == null) {
      this.setData(rows);

    // Setup default values
    } else {
      this.rows = rows || 0;
      this.cols = cols || 0;
      this.data = [];
      for (let row = 0; row < this.rows; row++) {
        this.data[row] = [];
        for (let col = 0; col < this.cols; col++) {
          if (ll == null || ul == null)
            this.data[row][col] = 0;
          else this.data[row][col] = Math.random() * (ul - ll) + ll;
        }
      }
    }
  }

  // #endregion


  // #region - In place

  setVal(row, col, val) {
    // Set a specific point to a value
    this.data[row][col] = val;
    return this;
  }


  setData(data) {
    // Set the data to specified values
    this.rows = data.length;
    this.cols = data[0].length;
    this.data = [];
    for (let row = 0; row < this.rows; row++) {
      this.data[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.data[row][col] = data[row][col];
      }
    }
    return this;
  }


  randomizeData(ll, ul) {
    // Randomize values
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.data[row][col] = Math.random() * (ul - ll) + ll;
      }
    }
    return this;
  }


  mapData(func) {
    // Map data values
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.data[row][col] = func(this.data[row][col], row, col);
      }
    }
    return this;
  }

  // #endregion


  // #region - Get data

  getVal(row, col) {
    // Return a specific value
    return this.data[row][col];
  }


  getRow(row) {
    // Return a specific row
    return new Matrix2([this.data[row]]);
  }


  getCol(col) {
    // Return a specific col
    let arr = [];
    for (let row = 0; row < this.rows; row++)
      arr.push([this.data[row][col]]);
    return new Matrix2(arr);
  }


  getRowList(row) {
    // Return a specific row
    return this.data[row];
  }


  getColList(col) {
    // Return a specific col
    return this.transpose().getRowList(col);
  }


  compareSize(oMat) {
    // Compare rows and columns to other matrix
    return (this.rows = oMat.rows
      && this.cols == oMat.cols);
  }


  toString() {
    // Cast to string, offsetting if any are negative
    let offset = this.data.map(r => r.some(v => (v < 0))).some(r =>  r);
    return this.data.map(
      row => row.map(
        v => ((v >= 0 && offset) ? " " : "") + v.toFixed(3)
      ).join("\t")
    ).join("\n");
  }


  shortToString() {
    // Cast to string, offsetting if any are negative
    return "[" + this.data.map(r => "[" + r.join(", ") + "]").join(", ") + "]";
  }

  // #endregion


  // #region - Arithmetic

  transpose() {
    // Return transposed matrix
    let newMat = new Matrix2(this.cols, this.rows);
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        newMat.data[col][row] = this.data[row][col];
      }
    }
    return newMat;
  }


  cross(oMat) {
    // Check other is mat2 and rows / cols match
    if (!oMat.isMatrix2) return null;
    if (this.cols != oMat.rows) return null;

    // Perform matrix cross multiplication with oMat
    let newMat = new Matrix2(this.rows, oMat.cols);
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < oMat.cols; col++) {
        let rowTrnsp = this.getRow(row).transpose();
        let oMatCol = oMat.getCol(col);
        newMat.setVal(row, col, rowTrnsp.dot(oMatCol));
      }
    }
    return newMat;
  }


  dot(oMat) {
    // Check other is matrix 2 and rows match
    if (!oMat.isMatrix2) return null;
    if (this.rows != oMat.rows) return null;

    // Perform dot product with oMat
    let total = 0;
    for (let row = 0; row < this.rows; row++)
      total += this.getVal(row, 0) * oMat.getVal(row, 0);
    return total;
  }


  multiply(scl) {
    // Multiply each value by scalar
    let newMat = new Matrix2(this.data);
    newMat.mapData((v, _r, _c) => (v * scl));
    return newMat;
  }


  add(oMat) {
    // Check other is matri2 and rows and columns match
    if (!oMat.isMatrix2) return null;
    if (oMat.rows != this.rows || oMat.cols != this.cols) return null;

    // Add this with other matrix 2
    let newMat = new Matrix2(this.data);
    newMat.mapData((v, r, c) => (v + oMat.getVal(r, c)));
    return newMat;
  }

  // #endregion
}
