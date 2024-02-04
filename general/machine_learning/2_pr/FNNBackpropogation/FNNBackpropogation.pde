float[][][] net;
float[][][] netPrevDif;
float[][][] trainingSet;

boolean hasMm;
boolean hasBias;
float lrnRate;
float mmRate;




void setup() {
  size(400, 400);

  SetupVariables();
  FullTrain(1000);
}


void SetupVariables() {
  hasMm = true;
  hasBias = true;
  lrnRate = 0.2;
  mmRate = 0.8;
}


void FullTrain(int amn) { // Make a network and train it
  net = RandomWeights(new int[] {2, 2, 1}, new float[] {-1, 1});
  netPrevDif = blankNet(net);

  trainingSet = new float[][][] {
    {{0, 0}, {0}}, 
    {{1, 0}, {1}}, 
    {{0, 1}, {1}}, 
    {{1, 1}, {0}}
  };

  float[][] checkSet = new float[][] {
    {0, 0},
    {0, 1}
  };

  for (int i = 0; i < amn; i++) {
    Train(net, trainingSet);
  }

  print("\nAverage error: " + Check(net, trainingSet));
  print("\n");
  Guess(net, checkSet);
}




void draw() {
  background(200);

  DrawNetwork(net, new PVector(50, 50), 40, new PVector(50, 50), new float[] {0.2, 1});
}
