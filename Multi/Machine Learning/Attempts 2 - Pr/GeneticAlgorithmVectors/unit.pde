class unit {
  
  
  PVector pos;
  boolean done;
  float fitness;
  data data;
  boolean best;
  
  
  //------------------------------------------------------------
 
  unit() {
    pos = new PVector(startPos.x, startPos.y);
    best = false;
    
    setupVariables();
  }
 
 
  void setupVariables() {
    done = false;
    fitness = 0;
  }
  
  
  //------------------------------------------------------------
  
  
  void update() { 
    if (!done) {
      
      pos.add(data.movementIterate());
    
      if (data.movements.size() == 0) {
        float d = dist(pos.x, pos.y, target.x, target.y);
        fitness = 1000 / (d * d);
        done = true;
      }
      
      if (dist(pos.x, pos.y, target.x, target.y) < (unitSize / 2 + targetSize / 2)) {
        fitness = 1 + (float)Math.pow(data.movements.size(), 3) / 10000;
        done = true;
      }
      
      if (pos.x - unitSize / 2 < 0 || pos.x + unitSize / 2 > width || pos.y - unitSize / 2 < 0 || pos.y + unitSize / 2 > height) {
        fitness = 0;
        done = true;
      }
    }
  }
  
  
  //------------------------------------------------------------
  
  
  void show() {
    if (best) {
      fill(100, 200, 100);
    } else {
      fill(150);  
    }
    stroke(100);
    ellipse(pos.x, pos.y, unitSize, unitSize); 
  }


  boolean getDone() {
    return done;
  }
  
  
  float getFitness() {
    return fitness;
  }
}
