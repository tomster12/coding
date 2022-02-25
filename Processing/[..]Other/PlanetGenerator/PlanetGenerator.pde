

ArrayList<Planet> planets;

void setup() {
  size(600, 600);

  planets = new ArrayList<Planet>();
  planets.add(new Planet(new PVector(300, 300), 500, new PVector(100, 100)));
}


void draw() {
  background(5, 10, 15);

  for (int i = 0; i < planets.size(); i++) {
    planets.get(i).show();
  }
}


void keyPressed() {
  planets.get(0).generateNewMap();
}
