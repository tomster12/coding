class connection {


  constructor(net_, inNo_, in_, out_, wt_) {
    this.net = net_;
    this.inNo = inNo_;
    this.nIn = in_;
    this.nOut = out_;
    this.weight = wt_;
    this.enabled = true;

  }


  Propogate(inp) {
    this.net.GetNeuron(this.nOut).Input(inp * this.weight);
  }
}
