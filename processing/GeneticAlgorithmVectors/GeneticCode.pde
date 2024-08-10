class geneticAlgorithm {


  ArrayList<unitData> unitDatas;
  boolean running;
  int size;


  //------------------------------------------------------------


  geneticAlgorithm (int size_) {   
    size = size_;
    setupUnitDatas();
  }


  void setupUnitDatas() {
    unitDatas = new ArrayList<unitData>();
    for (int i = 0; i < size; i++) {
      unit nUnit = new unit();
      data nData = new data();
      unitData nUnitData = new unitData(nUnit, nData);
      nUnitData.sendData();
      unitDatas.add(nUnitData);
    }
    updateGeneration();
  }


  //------------------------------------------------------------


  void update() {
    for (int i = 0; i < unitDatas.size(); i++) {
      unitDatas.get(i).unit.show();
    }

    if (running) {
      for (int i = 0; i < unitDatas.size(); i++) {
        unitDatas.get(i).unit.update();
      }
      if (checkDone()) {
        finishGeneration();
      }
    }
  }


  void quickUpdate() {
    while (true) {
      for (int i = 0; i < unitDatas.size(); i++) {
        unitDatas.get(i).unit.update();
      }
      if (checkDone()) {
        finishGeneration();
        break;
      }
    }
  }


  //------------------------------------------------------------



  void updateGeneration() {
    for (int i = 0; i < unitDatas.size(); i++) {
      unitDatas.get(i).update();
    }
  }   


  boolean checkDone() {
    for (int i = 0; i < unitDatas.size(); i++) {
      unitDatas.get(i).update();
      if (!unitDatas.get(i).done) {
        return false;
      }
    }
    return true;
  }


  void finishGeneration() {
    running = false;

    updateGeneration();
    sortGeneration();
    cullGeneration();
    getBestUnitData();
    makeGeneration();
  }


  //------------------------------------------------------------


  void sortGeneration() {
    quicksort(unitDatas, 0, unitDatas.size() - 1);

    toGraph2 = new float[unitDatas.size()];
    for (int i = 0; i < unitDatas.size(); i++) {
      toGraph2[i] = unitDatas.get(i).fitness;
    }
  }


  void quicksort(ArrayList<unitData> A, int lo, int hi) {
    if (lo < hi) {
      int p = partition(A, lo, hi);
      quicksort(A, lo, p - 1);
      quicksort(A, p + 1, hi);
    }
  }


  int partition(ArrayList<unitData> A, int lo, int hi) {
    float pivot = A.get(hi).fitness;
    int i = lo;
    for (int j = lo; j < hi; j++) {
      if (A.get(j).fitness < pivot) {
        unitData tmp = A.get(i);
        A.set(i, A.get(j));
        A.set(j, tmp);
        i++;
      }
    }
    unitData tmp = A.get(i);
    A.set(i, A.get(hi));
    A.set(hi, tmp);
    return i;
  }


  //-------------------


  void cullGeneration() {
    for (int i = 0; i < size / 2; i++) {
      unitDatas.remove(0);
    }
  }


  //-------------------


  void getBestUnitData() {
    bestUnitData = unitDatas.get(unitDatas.size() - 1 );
  }


  //-------------------


  void makeGeneration() {
    toGraph1 = new float[unitDatas.size()]; // Setup graphs

    ArrayList<unitData> nUnitDatas = new ArrayList<unitData>();  
    for (int i = 0; i < size; i++) { // Fill nUnitDatas
      unitData p1 = pickUnitData();
      unitData p2 = pickUnitData();     
      data nData = p1.data.makeChild(p2.data);  // Make child
      nData.mutate(); // Mutate
      unit nUnit = new unit(); // Make unit
      unitData nUnitData = new unitData(nUnit, nData); // Make unitData
      nUnitDatas.add(nUnitData); // Add to list
    }

    nUnitDatas.add(new unitData(new unit(), bestUnitData.data)); // Add previous best
    nUnitDatas.get(nUnitDatas.size() - 1).unit.best = true;

    unitDatas = nUnitDatas; // Set

    for (int i = 0; i < unitDatas.size(); i++) {
      unitDatas.get(i).sendData();
    }
  }


  unitData pickUnitData() {
    unitData nUnitData = null; 
    float fitTot = 0;
    for (int o = 0; o < unitDatas.size(); o++) { // Get total of other
      fitTot += unitDatas.get(o).fitness;
    }

    float pick = random(0, 1); // Pick random number in range of total
    float runTot = 0;

    for (int o = 0; o < unitDatas.size(); o++) { // Based on fitness choose other
      runTot += unitDatas.get(o).fitness / fitTot;
      if (pick < runTot) {
        nUnitData = unitDatas.get(o);
        toGraph1[o] += 1;
        break;
      }
    }
    return nUnitData;
  }


  //------------------------------------------------------------
}
