class connection {

  int inno;
  int nInInno;
  int nOutInno;
  
  float weight;
  
  network net;
  boolean enabled;


  connection(innovation inno_, network net_) {
    inno = inno_.inno;
    nInInno = inno_.nInInno;
    nOutInno = inno_.nOutInno;
    
    weight = random(net_.weightRange[0], net_.weightRange[1]);

    net = net_;
    enabled = true;
  }


  void propogate(float val) {
    if (enabled) {
      net.propogateInput(nOutInno, val * weight);
    }
  }
}
