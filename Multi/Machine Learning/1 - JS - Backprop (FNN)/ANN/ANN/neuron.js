class neuron {


  constructor(net_, lyr_, inNo_) {
    this.net = net_;
    this.inNo = inNo_;
    this.layerNo = lyr_;
    this.propIn = 0;
    this.propOut = 0;
    this.connections = [];
  }


  Input(inp) {
    this.propIn += inp;
  }


  Clear() {
    this.propIn = 0;
    this.propOut = 0;
  }


  Activate() {
    if (this.layerNo != 0) {
      this.propOut = Sigmoid(this.propIn);
    } else {
      this.propOut = this.propIn;
    }
  }
}


function Sigmoid(inp) {
  return 1 / (1 + exp(-inp));
}
