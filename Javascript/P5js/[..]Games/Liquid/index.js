
let GAME;

const MATERIALS = {
  blood: { col: "#cd2d2d", density: 1 }
}

function setup() {
  createCanvas(800, 800);
  noStroke();
  GAME = new Game();
}

function draw() {
  background(0);
  GAME.draw();
}


function mousePressed() {
  Drop.splatterDrops(GAME, { x: mouseX, y: mouseY }, MATERIALS.blood, 25, 6, 2.0);
}


class Utility {

  static UNITS_PER_METRE = 10;

  static getHemiSphereVolume(r) {
    const rm = r / this.UNITS_PER_METRE;
    return rm * rm * rm * 0.5;
  }
}


class Game {

  constructor() {
    this.entities = [];
  }

  draw() {
    this.update();
    this.show();
  }

  update() {
    for (let entity of this.entities) entity.update();
  }

  show() {
    for (let entity of this.entities) entity.show();
  }

  addEntity(e) { this.entities.push(e); }
  removeEntity(e) { this.entities.splice(this.entities.indexOf(e), 1); }
}


class Entity {

  constructor(game) {
    this.game = game;
  }

  update() {}
  show() {}
};


class Drop extends Entity {

  static ALL_DROPS = [];
  
  static REPEL_PCT = 0.7;
  static IDLE_PCT = 0.95;
  static ATTRACT_PCT = 1.05;
  static REPEL_FORCE = 1.0;
  static ATTRACT_FORCE = 0.05;
  static DRAG = 0.92;

  constructor(game, pos, radius, material) {
    super(game);
    Drop.ALL_DROPS.push(this);
    this.pos = { x: pos.x, y: pos.y };
    this.vel = { x: 0, y: 0 };
    this.material = material;
    this.radius = radius;
    this.mass = Utility.getHemiSphereVolume(this.radius) * this.material.density;
  }

  update() {
    this.updateRules();
    this.updateMovement();
  }

  updateRules() {
    for (let drop of Drop.ALL_DROPS) {
      if (this == drop) continue;

      // TODO: Fix this so that drops pool together and force is
      //        applied more realistically - smaller drops are
      //        pinging off one another.

      let total = this.radius + drop.radius;
      let dx = drop.pos.x - this.pos.x;
      let dy = drop.pos.y - this.pos.y;
      let dst = sqrt(dx * dx + dy * dy);
      if (dst == 0) continue;
      
      if (dst < (total * Drop.REPEL_PCT)) {
        let dirx = -dx / dst;
        let diry = -dy / dst;
        this.applyForce(dirx * Drop.REPEL_FORCE, diry * Drop.REPEL_FORCE);
      }

      else if (dst < (total * Drop.IDLE_PCT)) { }

      else if (dst < (total * Drop.ATTRACT_PCT)) {
        let dirx = dx / dst;
        let diry = dy / dst;
        this.applyForce(dirx * Drop.ATTRACT_FORCE, diry * Drop.ATTRACT_FORCE);
      }
    }
  }

  updateMovement() {
    this.pos.x += this.vel.x * 1.0 / 60.0;
    this.pos.y += this.vel.y * 1.0 / 60.0;
    this.vel.x *= Drop.DRAG;
    this.vel.y *= Drop.DRAG;
  }

  show() {
    fill(this.material.col);
    ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
  }

  applyForce(fx, fy, isImpulse=false) {
    let mult = 1.0 / this.mass
    if (!isImpulse) mult * (1.0 / 60.0);
    this.vel.x += fx * mult;
    this.vel.y += fy * mult;
  }

  static splatterDrops(game, pos, material, radiusMax, count, force) {
    let radiusMin = radiusMax * 0.2;
    for (let i = 0; i < count; i++) {
      let radius = radiusMin + random() * (radiusMax - radiusMin);
      let velAngle = random() * TWO_PI;
      let e = new Drop(game, pos, radius, material);
      e.applyForce(cos(velAngle) * force, sin(velAngle) * force, true);
      game.addEntity(e);
    }
  }
}


class Trail extends Entity {
  
}