
function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < 15; i++) new Drop(395 + random() * 10, 395 + random() * 10, "#ff2626", "#833e3e");
  noStroke();
}


function draw() {
  background(0);
  for (let entity of Entity.ALL_ENTITIES) entity.update();
  for (let entity of Entity.ALL_ENTITIES) entity.show();
}


class Entity {

  static ALL_ENTITIES = [];

  constructor() {
    Entity.ALL_ENTITIES.push(this);
  }

  update() {}
  show() {}
}


class Drop extends Entity {

  static ALL_DROPS = [];
  static REPEL_PCT = 0.2;
  static REPEL_FORCE = 5;
  static IDLE_PCT = 1.0;
  static ATTRACT_PCT = 2;
  static ATTRACT_FORCE = 0.2;
  static DRAG = 0.2;

  constructor(x, y, col) {
    super();
    Drop.ALL_DROPS.push(this);
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.col = col;
    this.radius = random() * 50 + 25;
  }

  update() {
    this.applyRules();
    this.applyMovement();
  }

  applyRules() {
    for (let drop of Drop.ALL_DROPS) {
      if (this == drop) continue;
      let total = this.radius + drop.radius;
      let dx = drop.pos.x - this.pos.x;
      let dy = drop.pos.y - this.pos.y;
      let dst = sqrt(dx * dx + dy * dy);
      
      if (dst < (total * Drop.REPEL_PCT)) {
        let dirx = -dx / dst;
        let diry = -dy / dst;
        let mag = Drop.REPEL_FORCE;
        this.vel.x += dirx * mag;
        this.vel.y += diry * mag;
      }

      else if (dst < (total * Drop.IDLE_PCT)) { }

      else if (dst < (total * Drop.ATTRACT_PCT)) {
        let dirx = dx / dst;
        let diry = dy / dst;
        let mag = Drop.ATTRACT_FORCE;
        this.vel.x += dirx * mag;
        this.vel.y += diry * mag;
      }
    }
  }

  applyMovement() {
    this.pos.x += this.vel.x * 1.0 / 60.0;
    this.pos.y += this.vel.y * 1.0 / 60.0;
    this.vel.x *= Drop.DRAG;
    this.vel.y *= Drop.DRAG;
  }

  show() {
    fill(this.col);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.radius, this.radius);

    // noFill();
    // stroke(255);
    // ellipse(this.pos.x, this.pos.y, this.radius, this.radius);

    // fill(255);
    // noStroke();
    // ellipse(this.pos.x, this.pos.y, 5, 5);
  }
}