
// #region - Setup

let inputs = {};

// Module aliases
let Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    World = Matter.World,
    Bodies = Matter.Bodies;

// Declare matter variables
let engine;
let render;
let mouse;
let mouseConstraint;


function setup() {
  setupVariables();
  setupWorld();
  setupEvents();
}


function setupVariables() {
  // Initialize matter variables
  engine = Engine.create();
  render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: 800,
      height: 600,
      showAngleIndicator: true
  }});

  // Run the physics engine and renderer
  Engine.run(engine);
  Render.run(render);
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }});

  // Create a mouse and mouse constraint
  mouse = Mouse.create(render.canvas);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
  }});
  World.add(engine.world, mouseConstraint);
  render.mouse = mouse;
}


function setupWorld() {
  // OR Gate
  // let gate = Composite.create();
  // Composite.add(gate, Bodies.rectangle(400, 200, 10, 100, { isStatic: true }));
  // Composite.add(gate, Bodies.rectangle(300, 190, 10, 80, { isStatic: true }));
  // Composite.add(gate, Bodies.rectangle(500, 190, 10, 80, { isStatic: true }));
  // Composite.add(gate, Bodies.rectangle(330, 295, 85, 10, { isStatic: true }));
  // Composite.add(gate, Bodies.rectangle(470, 295, 85, 10, { isStatic: true }));
  // Matter.Body.rotate(gate.bodies[3], 0.5);
  // Matter.Body.rotate(gate.bodies[4], -0.5);
  // World.add(engine.world, gate);

  // AND Gate
  let gate = Composite.create();
  Composite.add(gate, Bodies.rectangle(400, 200, 10, 100, { isStatic: true }));
  Composite.add(gate, Bodies.rectangle(300, 190, 10, 80, { isStatic: true }));
  Composite.add(gate, Bodies.rectangle(500, 190, 10, 80, { isStatic: true }));
  Composite.add(gate, Bodies.rectangle(330, 295, 85, 10, { isStatic: true }));
  Composite.add(gate, Bodies.rectangle(470, 295, 85, 10, { isStatic: true }));
  Matter.Body.rotate(gate.bodies[3], 0.5);
  Matter.Body.rotate(gate.bodies[4], -0.5);
  Composite.add(gate, Bodies.rectangle(400, 265, 150, 10 ));
  Composite.add(gate, Constraint.create({
    pointA: { x: 400, y: 265 },
    bodyB: gate.bodies[5],
    pointB: { x: 0, y: 0 } }));
  World.add(engine.world, gate);
}


function setupEvents() {
  // Before update event
  Events.on(engine, 'beforeUpdate', function(event) {

    if (Math.random() < 0.2) {
      if (inputs["q"]) {
        World.add(engine.world, Bodies.circle(340, 80, 5));
        World.add(engine.world, Bodies.circle(350, 80, 5));
        World.add(engine.world, Bodies.circle(360, 80, 5));
      }
      if (inputs["e"]) {
        World.add(engine.world, Bodies.circle(440, 80, 5));
        World.add(engine.world, Bodies.circle(450, 80, 5));
        World.add(engine.world, Bodies.circle(460, 80, 5));
      }
    }

    // Remove objects off screen
    for (let body of engine.world.bodies) {
      if (body.position.x < -100
      || body.position.x > 900
      || body.position.y < -100
      || body.position.y > 700) {
        World.remove(engine.world, body);
      }
    }
  });

  // Input document events
  document.body.addEventListener("keydown", function(e) { inputs[e.key] = !inputs[e.key]; });
}

// #endregion
