

void setup() {
  size(400, 400); 
}


void draw() {
  background(100); 
  
  updateNotifications();
}


void mousePressed() {
  addNotification(new PVector(mouseX, mouseY), "" + random(100), 100);
}
