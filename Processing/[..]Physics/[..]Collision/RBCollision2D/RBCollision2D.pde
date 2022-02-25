
RigidWorld rworld;


void setup() {
  size(800, 800);

  // Create rigid world
  rworld = new RigidWorld();
  rworld.addResolver(new ImpulseResolver());
  rworld.addResolver(new PositionResolver());

  // Create rigid bodies
  float border = 40;
  rworld.addBody(new RigidBody(
    new Transform(new Float2(width * 0.5, border * 0.5), 0, new Float2(width, border)),
    new RectCollider(), true));
  rworld.addBody(new RigidBody(
    new Transform(new Float2(width * 0.5, height - border * 0.5), 0, new Float2(width, border)),
    new RectCollider(), true));
  rworld.addBody(new RigidBody(
    new Transform(new Float2(border * 0.5, height * 0.5), 0, new Float2(border, height - border * 2)),
    new RectCollider(), true));
  rworld.addBody(new RigidBody(
    new Transform(new Float2(width - border * 0.5, height * 0.5), 0, new Float2(border, height - border * 2)),
    new RectCollider(), true));

  RigidBody rb1 = rworld.addBody(new RigidBody(
    new Transform(new Float2(250, 220), 0, new Float2(100, 100)),
    new CircleCollider()));
  rb1.velocity.iadd(new Float2(60, 8));

  rworld.addBody(new RigidBody(
    new Transform(new Float2(500, 300), 0, new Float2(50, 50)),
    new CircleCollider()));

  rworld.addBody(new RigidBody(
    new Transform(new Float2(550, 400), 0, new Float2(80, 80)),
    new CircleCollider()));
}


void draw() {
  background(0);

  // Add RBs on mouse down
  if (mousePressed) createRandomRB();

  // Step rigid world and show
  float dt = 1 / frameRate;
  for (int i = 0; i < 3; i++) rworld.step(dt / 3);
  rworld.show();
}


void keyPressed() {
  // Add RB on space
  if (keyCode == 32) createRandomRB();
}


void createRandomRB() {
  // Create and add a random RB
  float r = random(50) + 15;
  RigidBody rb = rworld.addBody(new RigidBody(
    new Transform(new Float2(mouseX, mouseY), 0, new Float2(r, r)),
    new CircleCollider()));
  rb.velocity.iadd(new Float2(mouseX - pmouseX, mouseY - pmouseY).mult(35));
}
