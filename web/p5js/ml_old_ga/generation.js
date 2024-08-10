class geneticAlgorithm {
  constructor(genepoolAmount_, dataAmount_, dataRange_, unitSize_, mutationRate_, unData) {
    this.genRunning = false;
    this.genLoop = false;
    this.genepool = [];
    this.maxFitness = 0;

    this.genepoolAmount = genepoolAmount_;
    this.dataAmount = dataAmount_;
    this.dataRange = dataRange_;
    this.unitSize = unitSize_;
    this.mutationRate = mutationRate_;

    this.unData = unData;

    this.CreateGenepool();
  }


  CreateGenepool() {
    for (let i = 0; i < this.genepoolAmount; i++) {
      this.genepool.push(new unitData(null, RandomDataSet(this.dataAmount, this.dataRange), 0));
    }
  }


  // ---------------------------------------------------------------------


  StartGeneration() {
    this.CreateObjects();
    this.genRunning = true;

    console.log("Start Generation");
  }


  // ---------------------------------------------------------------------


  RunningGeneration() {
    text(this.maxFitness, 0, height);

    if (this.genRunning) {
      for (let i = 0; i < this.genepool.length; i++) {
        this.genepool[i].obj.Update();
      }
      if (this.AllDone()) {
        this.FinishGeneration();
      }
    }
  }


  Update() {
    this.RunningGeneration();
  }


  KeyPressed() {
    switch(keyCode) {
      case 32:                // Space
       if (!this.genRunning) {
         this.StartGeneration();
       } else {
         console.log("Already Running");
       }
       break;

      case 9:                 // Tab
       this.genLoop = !this.genLoop;
       console.log("genLoop: " + this.genLoop);
       break;
    }
  }


  // ---------------------------------------------------------------------


  FinishGeneration() {
    this.GetFitnesses();
    this.CullGeneration();
    this.MakeGeneration();
    this.MutateGeneration();
    this.genRunning = false;
    console.log("End Generation");

    if (this.genLoop) {
      this.StartGeneration();
    }
  }


  // ---------------------------------------------------------------------
  // ---- FinishGeneration Functions
  // ---------------------------------------------------------------------


  GetFitnesses() {
    for (let i = 0; i < this.genepool.length; i++) {
      this.genepool[i].fitness = this.genepool[i].obj.GetFitness();
      if (this.genepool[i].fitness > this.maxFitness) {
        this.maxFitness = this.genepool[i].fitness;
      }
    }
  }


  // ---------------------------------------------------------------------

  
  CullGeneration() {
    quicksort(this.genepool, 0, this.genepool.length - 1);
    for (let i = 0; i < this.genepoolAmount / 2; i++) {
      this.genepool.splice(0, 1);
    }
  }


  // ---------------------------------------------------------------------


  MakeGeneration() {
    let newGeneration = [];
    for (let i = 0; i < this.genepoolAmount; i++) {
      let p1 = this.PickParent(this.genepool);
      let p2 = this.PickParent(this.genepool);
      let child = this.MakeChild(p1, p2);
      newGeneration.push(child);
    }
    this.DeleteObjects();
    this.genepool = newGeneration;
  }


  // ---------------------------------------------------------------------


  MutateGeneration() {
    for (let i = 0; i < this.genepool.length; i++) {
      for (let o = 0; o < this.genepool[i].data.length; o++) {
        if (random() < this.mutationRate) {
          this.genepool[i].data[o] = RandomData(this.dataRange);
        }
      }
    }
  }


  // ---------------------------------------------------------------------
  // ---- Other Functions
  // ---------------------------------------------------------------------


  PickParent(genepool) {
    let totSum = 0;
    for (let i = 0; i < genepool.length; i++) { // Total sum
      totSum += genepool[i].fitness;
    }

    let pick = random(0, totSum);
    let runSum = 0;
    for (let i = 0; i < genepool.length; i++) { // Find where pick is in sum
      runSum += genepool[i].fitness;
      if (pick < runSum) {
        return genepool[i];
      }
    }
    return null;
  }


  // ---------------------------------------------------------------------


  MakeChild(p1, p2) {
    return MakeChild(p1, p2);
  }


  // ---------------------------------------------------------------------


  CreateObjects() {
    for (let i = 0; i < this.genepool.length; i++) {
      this.genepool[i].obj = new unit(this.genepool[i].data.slice(), this.unitSize, this.unData);
    }
  }


  // ---------------------------------------------------------------------


  DeleteObjects() {
    for (let i = 0; i < this.genepool.length; i++) {
      this.genepool[i].obj = null;
    }
  }


  // ---------------------------------------------------------------------


  AllDone() {
    for (let i = 0; i < this.genepool.length; i++) {
      if (!this.genepool[i].obj.done) {
        return false;
      }
    }
    return true;
  }
}
