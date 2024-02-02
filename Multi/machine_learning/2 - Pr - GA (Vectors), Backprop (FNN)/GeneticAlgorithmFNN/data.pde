class data {


  float[][][] network;


  //------------------------------------------------------------


  data(float[][][] network_) {
    network = network_;
  }


  data() {
    network = RandomWeights(new int[] {4, 4, 4, 2}, new float[] {-dataRange, dataRange}, false);
  }


  //------------------------------------------------------------


  data getCopy() {
    return new data(network);
  }


  data makeChild(data p2) {
    int cW = 0;
    int tW = 0;
    for (int i = 0; i < network.length; i++) {
      for (int o = 0; o < network[i].length; o++) {
        for (int p = 0; p < network[i][o].length; p++) {
          tW++;
        }
      }
    }
    float[][][] nNetwork = new float[network.length][][];
    for (int i = 0; i < nNetwork.length; i++) {
      nNetwork[i] = new float[network[i].length][];
      for (int o = 0; o < nNetwork[i].length; o++) {
        nNetwork[i][o] = new float[network[i][o].length];
        for (int p = 0; p < nNetwork[i][o].length; p++) {
          cW++;
          if (cW < tW / 2) {
            nNetwork[i][o][p] = network[i][o][p];
          } else {
            nNetwork[i][o][p] = p2.network[i][o][p];
          }
        }
      }
    }
    return new data(nNetwork);
  }


  void mutate() {
    for (int i = 0; i < network.length; i++) {
      for (int o = 0; o < network[i].length; o++) {
        for (int p = 0; p < network[i][o].length; p++) {
         if (random(1) < mutationRate) {
           network[i][o][p] = random(-dataRange, dataRange);
         }
        }
      }
    }
  }


  //------------------------------------------------------------
}
