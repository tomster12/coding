class data {
  
  
  ArrayList<PVector> movements;
  
  
  //------------------------------------------------------------
  
  
  data(ArrayList<PVector> movements_) {
    movements = movements_;
  }
  
  
  data() {
    movements = new ArrayList<PVector>();
    for (int i = 0; i < dataSize; i++) {
      movements.add(new PVector(random(-dataRange, dataRange), random(-dataRange, dataRange))); 
    }
  }
  
  
  //------------------------------------------------------------


  PVector movementIterate() {
    PVector movement = movements.get(0);
    movements.remove(0);
    return movement;
  }
  
  
  data getCopy() {
    ArrayList<PVector> nMovements = new ArrayList<PVector>();
    for (int i = 0; i < movements.size(); i++) {
      PVector cm = movements.get(i);
      nMovements.add(new PVector(cm.x, cm.y)); 
    }
    return new data(nMovements);
  }
   
  
  data makeChild(data p2) {
    ArrayList<PVector> nMovements = new ArrayList<PVector>();
    for (int i = 0; i < movements.size() / 2; i++) {
      nMovements.add(movements.get(i));
    }
    for (int i = floor(p2.movements.size() / 2); i < p2.movements.size(); i++) {
      nMovements.add(p2.movements.get(i));
    }
    return new data(nMovements);
  }
  
  
  void mutate() {
    for (int i = 0; i < movements.size(); i++) {
      if (random(1) < mutationRate) {
        movements.set(i, new PVector(random(-dataRange, dataRange), random(-dataRange, dataRange))); 
      }
    }
  }


  //------------------------------------------------------------
}
