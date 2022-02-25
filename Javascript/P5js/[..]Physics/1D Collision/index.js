
// Main variables
let objects = [];
let interaction = null;
let updatePerFrame = 3;


// Setup p5.js functions
function setup() {
  createCanvas(500, 300);
  rectMode(CENTER);
}


// Main update function
function draw() {
  background(30, 30, 35);
  noStroke();
  fill(200);

  // Update each object
  for (let i = 0; i < updatePerFrame; i++) {
    for (let obj of objects)
      obj.collision();
    for (let obj of objects)
      obj.movement();
  }

  // Show each object
  for (let obj of objects)
    obj.show();

  // Get total kinetic energy of objects
  let totKe = 0;
  for (let obj of objects)
  totKe += obj.ke;
  text(totKe, width / 2, height * 0.9);

  // Interacting
  if (interaction != null) {
    interaction.direction = abs(mouseX - interaction.pos);

    // Dragging an object
    if (interaction.dragging) {
      stroke(120);
      line(interaction.object.pos, height / 2, mouseX, height / 2);

    // Creating a object
    } else {
      fill(200, 100);
      rect(interaction.pos, height / 2, interaction.direction * 2, height / 2);
    }
  }
}


function mousePressed() {
  // Dragging an object
  for (let obj of objects) {
    if (mouseX > obj.pos - obj.size / 2 && mouseX < obj.pos + obj.size / 2) {
      interaction = {
        "object": obj,
        "dragging": true
      }
    }
  }

  // Creating an object
  if (interaction == null) {
    interaction = {
      "pos": mouseX,
      "dragging": false
    }
  }
}


function mouseReleased() {
  // Dragged an object
  if (interaction.dragging) interaction.object.vel += (mouseX - interaction.object.pos) / 50;

  // Created an object
  else objects.push(new Obj(interaction.pos, interaction.direction * 2, 0));

  interaction = null;
}


// Main object class
class Obj {
  constructor(x, s, v) {
    this.pos = x;
    this.size = s;
    this.vel = v;
    this.nVel = null;
    this.mass = this.size / 100;
    this.ke = 0;
  }


  // Show a rect at the object's position
  show() {
    rectMode(CENTER);
    rect(this.pos, height / 2, this.size, height / 2);
    let rKe = Math.floor(this.ke * 100) / 100;
    text(rKe, this.pos, height * 0.8);
  }


  // Move the object based on its velocity
  movement() {
    if (this.nVel != null) {
      this.vel = this.nVel;
      this.nVel = null;
    }
    this.pos += this.vel / updatePerFrame;
    this.ke = (0.5 * this.mass * this.vel * this.vel);
  }


  // collide this object with all other objects and edges
  collision() {
    for (let obj of objects) {

      // Collided with other object
      if ((this.pos - this.size / 2 < obj.pos + obj.size / 2
        && this.pos > obj.pos)
      || (this.pos + this.size / 2 > obj.pos - obj.size / 2
        && this.pos < obj.pos)
      ) this.collide(obj);
    }

    // Collided with edge
    if (this.pos + this.size / 2 > width || this.pos - this.size / 2 < 0) {
      this.vel *= -1;
    }
  }


  // Perform collision calculation with another object and affect self
  collide(obj) {
    this.nVel = (this.vel * (this.mass - obj.mass) + (2 * obj.mass * obj.vel)) / (this.mass + obj.mass);
  }
}
