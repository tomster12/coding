

network net;
innovationManager innoManager;

int loopLimit;


void setup() {
  size(1500, 800);

  loopLimit = 20;
  innoManager = new innovationManager();
  net = new network(new int[] {3, 1}, true, true);
}


void draw() {
  background(200);
  DrawNetwork(net, new PVector(50, 50), 25, new PVector(50, 200), new float[] {0.5, 4});
}


void keyPressed() {
  if (keyCode == 9) {
    if (random(1) < 0.5) {
      net.addConnection();
    } else {
      net.addNeuron();
    }
  }
  if (keyCode == 81) {
    debugNet(net);
  }
  if (keyCode == 87) {
    float[] outputs = net.propogate(new float[] {1, 0.4, 2}); 
    print("\nOutputs: ");
    for (int i = 0; i < outputs.length; i++) {
      print("\n  " + outputs[i]); 
    }
  }
}


void debugNet(network net_) {
  print("\nLayers: " + net_.layers.size());
  for (int i = 0; i < net_.layers.size(); i++) {
    print("\n  Neurons: "+ net_.layers.get(i).size());
    for (int o = 0; o < net_.layers.get(i).size(); o++) {
      print("\n    Number: " + net_.layers.get(i).get(o).nInno);
    }
  }
  print("\n\nConnections: " + net_.connections.size());
  for (int i = 0; i < net_.connections.size(); i++) {
    connection cn = net_.connections.get(i);
    print("\nConnection: " + cn.nInInno + " -> " + cn.nOutInno + " - enabled: " + cn.enabled);
  }
}
