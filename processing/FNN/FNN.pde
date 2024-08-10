

float[][][] net;
boolean hasBias = true;


void setup() {
  size(400, 400);

  net = RandomWeights(new int[] {6, 7, 5, 6, 4}, new float[] {-1, 1});
}


void draw() {
  background(200);

  if (net != null) {
    DrawNetwork(net, new PVector(50, 20), 30, new PVector(50, 50), new float[] {0.5, 2});
  }
}


void keyPressed() {
  if (keyCode == 9) {
    int[] size = new int[floor(random(2, 6))];
    for (int i = 0; i < size.length; i++) {
      size[i] = floor(random(1, 6));
    }
    hasBias = (floor(random(2)) == 0 ? false : true);
    net = RandomWeights(size, new float[] {-1, 1});
  }
}
