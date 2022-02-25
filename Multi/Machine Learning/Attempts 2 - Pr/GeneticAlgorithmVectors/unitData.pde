class unitData {
  
  
  unit unit;
  data data;
  float fitness;
  boolean done;
  
  
  //------------------------------------------------------------
  
  
  unitData(unit unit_, data data_) {
    unit = unit_;
    data = data_;

    fitness = 0;
    done = false;
  } 

  //------------------------------------------------------------
  
  
  void update() {
    fitness = unit.getFitness();
    done = unit.getDone();
  }
  
  
  //------------------------------------------------------------
  
  
  void sendData() {
    unit.data = data.getCopy();
  }
  
  
  //------------------------------------------------------------
}
