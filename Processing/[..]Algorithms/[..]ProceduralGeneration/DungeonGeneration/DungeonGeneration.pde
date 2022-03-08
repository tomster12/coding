

ArrayList<dRoom> testRooms = new ArrayList<dRoom>();
PVector dSize = new PVector(10, 10);
PVector dPos = new PVector(150, 150);
int dSizeMult = 50;




void setup() {
  size(800, 800);
}




void draw() {
  background(150);
  
  
  fill(180);
  noStroke();
  rect(dPos.x, dPos.y, dSize.x * dSizeMult, dSize.y * dSizeMult);
  
  drawDungeon(testRooms);
}




void keyPressed() {
  
  
  switch(keyCode) {
    
  case 9: // tab
    testRooms = new ArrayList<dRoom>();
    makeRooms(testRooms, dSize, true, 0.6); // multiroom, roomChance
    break;
  }
}
