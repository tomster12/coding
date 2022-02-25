
// #region - Setup

final float zMult = 0.4;
boolean[] inputs;
Player player;
ArrayList<Blob> blobs;


void setup() {
  size(700, 700);
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  inputs = new boolean[400];
  blobs = new ArrayList<Blob>();

  // Add player and animals
  player = new Player(new PVector(width * 0.5, height * 0.5));
  blobs.add(player);
  for (int i = 0; i < 15; i++)
    blobs.add(new Animal(new PVector(random(width), random(height))));
}

// #endregion


// #region - Main

void draw() {
  background(147, 199, 122);
  sortBlobs();
  updateBlobs();
}


void sortBlobs() {
  // Selection sort based on pos.y
  for (int i = 0; i < blobs.size(); i++) {
    int lowestIndex = i;
    float lowestPosY = blobs.get(i).pos.y;
    for (int o = i; o < blobs.size(); o++) {
      if (blobs.get(o).pos.y < lowestPosY) {
        lowestIndex = o;
        lowestPosY = blobs.get(o).pos.y;
      }
    }
    Blob temp = blobs.get(i);
    blobs.set(i, blobs.get(lowestIndex));
    blobs.set(lowestIndex, temp);
  }
}


void updateBlobs() {
  // Move camera to player
  player.translateCamera();

  // Update and show all blobs
  for (Blob blob : blobs)
    blob.update();
  for (Blob blob : blobs)
    blob.showShadow();
  for (Blob blob : blobs)
    blob.show();
}


void keyPressed() {
  inputs[keyCode] = true;
}


void keyReleased() {
  inputs[keyCode] = false;
}


int sign(float value) {
  return value > 0 ? 1 : -1;
}

// #endregion


abstract class Blob {

  // #region - Main

  PVector pos;
  PVector vel;
  float moveAcc;
  float maxSpeed;
  float size;
  color col;


  Blob(PVector pos_, float moveAcc_, float maxSpeed_, float size_, color col_) {
    pos = pos_;
    vel = new PVector(0, 0, 0);
    moveAcc = moveAcc_;
    maxSpeed = maxSpeed_;
    size = size_;
    col = col_;
  }


  PVector getShowPos() {
    return new PVector(pos.x, pos.y - size * 0.5 - pos.z * zMult);
  }


  void update() {
    movement();
  }


  void showShadow() {
    fill(50, 100);
    noStroke();
    ellipse(pos.x, pos.y, size * 0.8, size * 0.8 * zMult);
  }


  void show() {
    PVector showPos = getShowPos();
    fill(col);
    noStroke();
    ellipse(showPos.x, showPos.y, size, size);
  }


  abstract void movement();

  // #endregion
}


class Player extends Blob {

  // #region - Main

  Player(PVector pos_) {
    super(pos_, 0.2, 2, 80, color(101, 184, 179));
  }


  @Override
  void movement() {
    // Accelerate based on input
    PVector dir = new PVector(
      (inputs[37] ? -1 : 0) + (inputs[39] ? 1 : 0),
      (inputs[38] ? -1 : 0) + (inputs[40] ? 1 : 0)
    ).normalize();
    vel.add(dir.mult(moveAcc));
    if (pos.z == 0 && inputs[32]) vel.z += 10;

    // Limit vel
    vel.z -= 0.5;
    vel = new PVector(
      max(min(vel.x, maxSpeed), -maxSpeed),
      max(min(vel.y, maxSpeed), -maxSpeed),
      vel.z
    );
    vel.x *= 0.9;
    vel.y *= 0.9;

    // Update pos
    pos.add(vel);
    if (pos.z < 0) {
      pos.z = 0;
      vel.z = 0;
    }
  }


  void translateCamera() {
    translate(width * 0.5 - pos.x, height * 0.5 - pos.y);
  }

  // #endregion
}


class Animal extends Blob {

  // #region - Main

  Blob following;
  float followDistance;
  float noticeDistance;
  float loseDistance;

  PVector idleDirection;
  float idleTime;
  float[] idleTimeRange;
  float idleChance;


  Animal(PVector pos_) {
    super(pos_, 0.2, 2.2, random(10) + 15, color(200 + random(10), 180 + random(10), 105 + random(10)));

    following = null;
    followDistance = random(80) + 100;
    noticeDistance = random(80) + 220;
    loseDistance = noticeDistance + random(80);

    idleDirection = null;
    idleTime = 0;
    idleTimeRange = new float[] {40 + random(30), 70 + random(30)};
    idleChance = 0.001;
  }


  void update() {
    ai();
    super.update();
  }


  void ai() {
    if (dist(pos.x, pos.y, player.pos.x, player.pos.y) < noticeDistance)
      following = player;
    if (following != null) {
      if (dist(pos.x, pos.y, following.pos.x, following.pos.y) > loseDistance)
        following = null;
    }
  }


  @Override
  void movement() {

    // Calculate movement direction
    PVector dir = null;

    // Move towards following
    if (following != null && dist(pos.x, pos.y, following.pos.x, following.pos.y) > followDistance) {
      idleDirection = null;
      idleTime = 0;
      dir = new PVector(
        following.pos.x - pos.x,
        following.pos.y - pos.y
      ).normalize();

    // Update idle movement
    } else {
      if (idleTime > 0) {
        dir = idleDirection.copy();
        idleTime--;
        if (idleTime <= 0) {
          idleDirection = null;
          idleTime = 0;
        }
      } else if (random(1) < idleChance) {
        float angle = random(TWO_PI);
        idleDirection = new PVector(cos(angle), sin(angle));
        idleTime = idleTimeRange[0] + random(idleTimeRange[1] - idleTimeRange[0]);
      }
    }

    // Update vel
    if (dir != null) {
      vel.add(dir.mult(moveAcc));
      if (pos.z == 0) vel.z += random(4) + 4;
    }
    vel.z -= 0.5;
    vel = new PVector(
      max(min(vel.x, maxSpeed), -maxSpeed),
      max(min(vel.y, maxSpeed), -maxSpeed),
      vel.z
    );
    vel.x *= 0.9;
    vel.y *= 0.9;

    // Update pos
    pos.add(vel);
    pos.z = max(pos.z, 0);
  }

  // #endregion
}
