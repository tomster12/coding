

float distance;
float speed;
ArrayList<Point> points;


void setup() {
  size(800, 800);

  distance = 140;
  speed = 5;
  points = new ArrayList<Point>();
  for (int i = 0; i < 100; i++) {
    points.add(new Point(new PVector(random(width), random(height)), i));
  }
}


void draw() {
  background(0);

  for (int i = 0; i < points.size(); i++) {
    points.get(i).movement();
  }
  for (int i = 0; i < points.size(); i++) {
    points.get(i).gravity();
  }
  for (int i = 0; i < points.size(); i++) {
    points.get(i).show();
  }
}
