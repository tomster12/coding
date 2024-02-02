

// #region - Setup

import processing.sound.*;

ArrayList<String> texts;
int score;
Player player;
ArrayList<Enemy> enemies;
ArrayList<Projectile> projectiles;
ArrayList<Particle> particles;

float[] pSizeRange;
float[] eSizeRange;
String[] soundNames;
SoundFile[] sounds;



void setup() {
  size(600, 600);
  stroke(255);
  noFill();
  setupVariables();
}


void setupVariables() {
  texts = new ArrayList<String>();
  player = new Player(
    new PVector(300, 300)
  );
  enemies = new ArrayList<Enemy>();
  projectiles = new ArrayList<Projectile>();
  particles = new ArrayList<Particle>();

  pSizeRange = new float[] {5, 35};
  eSizeRange = new float[] {20, 50};
  soundNames = new String[] {
    "SoundShoot.wav",
    "SoundExplosion1.wav",
    "SoundExplosion2.wav",
    "SoundPowerup1.wav",
    "SoundPowerup2.wav",
    "SoundDamage1.wav",
    "SoundDamage2.wav"
  };
  sounds = new SoundFile[soundNames.length];
  for (int i = 0; i < soundNames.length; i++) {
    sounds[i] = new SoundFile(this, soundNames[i]);
  }
}

// #endregion


// #region - Update Functions

void draw() {
  background(0);
  textAlign(CENTER);
  textSize(35);

  update();
  showOther();
  spawnEnemies();

  textSize(15);
  textAlign(LEFT);
  for (int i = 0; i < texts.size(); i++) {
    text(texts.get(i),0, 300+i*15);
  }
}


void update() {
  if (frameCount % 30 == 0 && player.alive) {
    score++;
  }
  player.update();
  for (int i = enemies.size()-1; i >= 0 &&  i < enemies.size(); i--) {
    enemies.get(i).update();
  }
  for (int i = 0; i < projectiles.size(); i++) {
    projectiles.get(i).update();
  }
  for (int i = 0; i < particles.size(); i++) {
    particles.get(i).update();
  }
}


void showOther() {
  stroke(255);
  noFill();
  text(score, 300, 50);
}


void spawnEnemies() {
  if (random(1) < 1.0/60.0 && player.alive) {
    float a = random(TWO_PI);
    float dg = width/2 + height/2;
    float s = random(eSizeRange[0], eSizeRange[1]);
    PVector pos = new PVector(width/2 + s/2 + cos(a)*dg, height/2 + s/2 + sin(a)*dg);
    enemies.add(new Enemy(
      pos,
      new PVector(0, 0),
      s
    ));
  }
}


void addText(String txt) {texts.add(0,txt);}

// #endregion


// #region - Input Functions

void keyPressed() {
  player.im.input("press", keyCode);
}


void keyReleased() {
  player.im.input("release", keyCode);
}

// #endregion
