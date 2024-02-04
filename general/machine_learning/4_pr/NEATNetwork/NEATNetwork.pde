

int[] netIoSize;
float[] netWRange;
InnoManager innoMng;

Network net1;
Network net2;
Network net3;
NetDrawer netDrw1;
NetDrawer netDrw2;
NetDrawer netDrw3;


void setup() {
  size(600, 600);

  netIoSize = new int[] {4, 2};
  netWRange = new float[] {-1, 1};
  innoMng = new InnoManager(netIoSize);

  net1 = new Network(innoMng, netIoSize, netWRange);
  net2 = new Network(innoMng, netIoSize, netWRange);
  netDrw1 = new NetDrawer(net1, new PVector(0, 0), new PVector(200, 200), 15);
  netDrw2 = new NetDrawer(net2, new PVector(200, 0), new PVector(200, 200), 15);
}


void draw() {
  background(200);
  noStroke();
  fill(150);

  netDrw1.drawNetwork();
  drawText(net1, new PVector(0+10, 200), 200-20, 10);

  netDrw2.drawNetwork();
  drawText(net2, new PVector(200+10, 200), 200-20, 10);

  if (netDrw3 != null) {
    netDrw3.drawNetwork();
    drawText(net3, new PVector(400+10, 200), 200-20, 10);
  }

  noStroke();
  fill(0);
  textAlign(CENTER);
  text(net1.speciateDistance(net2), 300, 10);
  if (net3 != null) {
    text(net1.speciateDistance(net3), 300, 20);
    text(net2.speciateDistance(net3), 300, 30);
  }
}


void drawText(Network net, PVector pos, float wdth, float tSize) {
  noStroke();
  fill(0);
  textSize(tSize);

  textAlign(LEFT);
  for (int i = 0; i < net.neurons.size(); i++) {
    Neuron c = net.neurons.get(i);
    String cString = ""+c.nInno+":"+c.propLevel;
    text("N: " + cString, pos.x, pos.y + i * tSize);
  }
  textAlign(RIGHT);
  for (int i = 0; i < net.connections.size(); i++) {
    Connection c = net.connections.get(i);
    String cString = ""+c.cInno+":"+c.nIn+":"+c.nOut+":"+(floor(c.weight*1000)/1000)+":"+c.enabled;
    text("C: " + cString, pos.x + wdth, pos.y + i * tSize);
  }
}


void keyPressed() {
  if (keyCode == 78) {
    net1.mutate();
    netDrw1.updateNetwork();

  } else if (keyCode == 77) {
    net2.mutate();
    netDrw2.updateNetwork();

  } else if (keyCode == 9) {
    net3 = net1.crossover(net2);
    netDrw3 = new NetDrawer(net3, new PVector(400, 0), new PVector(200, 200), 15);

  } else if (keyCode == 81) {
    net1 = new Network(innoMng, netIoSize, netWRange);
    net2 = new Network(innoMng, netIoSize, netWRange);
    netDrw1 = new NetDrawer(net1, new PVector(0, 0), new PVector(200, 200), 15);
    netDrw2 = new NetDrawer(net2, new PVector(200, 0), new PVector(200, 200), 15);
  }
}
