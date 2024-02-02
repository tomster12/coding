class neuron {


  int nInno;
  int layer;
  network net;
  
  float propTot;


  neuron(int nInno_, int layer_, network net_) {
    nInno = nInno_;
    layer = layer_;
    net = net_;
  }


  void input(float val) {
    propTot += val;
  }


  void propogate() {
    net.propogateConnection(nInno, propTot);
  }
  
  
  void activate() {
    propTot = 1 / (1 + exp(-propTot)); 
  }
  
  void clear() {
    propTot = 0; 
  }
}
