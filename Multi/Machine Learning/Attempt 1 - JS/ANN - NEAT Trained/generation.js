// ---------------------------------------------------------------------


class geneticAlgorithm {
  constructor(genepoolAmount_, dataRange_, unitSize_, mutationRate_) {
    this.genRunning = false;
    this.genLoop = false;
    this.genepool = [];
    this.maxFitness = 0;
    this.nextSpecies = 1;

    this.genepoolAmount = genepoolAmount_;
    this.dataRange = dataRange_;
    this.unitSize = unitSize_;
    this.mutationRate = mutationRate_;

    this.CreateGenepool();
  }


  CreateGenepool() {
    for (let i = 0; i < this.genepoolAmount; i++) {
      this.genepool.push(new unitData(null, RandomDataSet(this.dataRange), 0, 0));
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
    fill(0, 0, 0);
    noStroke();
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
    for (let i = 0; i < foods.length; i++) {
      foods[i].update();
    }
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
    let spAm = [];

    for (let i = 0; i < this.genepool.length; i++) {
      this.genepool[i].fitness = this.genepool[i].obj.GetFitness();
      let am = 0;
      for (let o = 0; o < this.genepool.length; o++) {
        if (this.genepool[i].species == this.genepool[o].species) {
          am++;
        }
      }
      this.genepool[i].fitness = this.genepool[i].fitness / am;

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
      let child = MakeChild(p1.data, p2.data);
      newGeneration.push(child);
    }
    this.AssignSpecies(newGeneration, this.genepool);
    this.DeleteObjects();
    this.genepool = newGeneration;
  }


  // ---------------------------------------------------------------------


  MutateGeneration() {
    for (let i = 0; i < this.genepool.length; i++) {
      if (random() < this.mutationRate) {
        this.genepool[i].data.Mutate();
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



  AssignSpecies(newGen, oldGen) {
    for (let i = 0; i < newGen.length; i++) {
      let found = null;

      for (let o = 0; o < oldGen.length; o++) {
        if (this.GeneticDistance(newGen[i], oldGen[o]) < compatibility) {
          found = oldGen[o].species;
        }
      }

      if (found != null) {
        newGen[i].species = found;

      } else {
        newGen[i].species = this.nextSpecies;
        this.nextSpecies++;
      }
    }
  }


  // ---------------------------------------------------------------------


  GeneticDistance(p1, p2) {
    let e = 0;
    let w = 0;

    for (let i = 0; i < p1.data.connections.length; i++) {
      let found = false;
      for (let o = 0; o < p2.data.connections.length; o++) {
        if (p1.data.connections[i].inNo == p2.data.connections[o].inNo) {
          found = Math.abs(p1.data.connections[i].weight - p2.data.connections[o].weight);
        }
      }
      if (found != false) {
        w += found;
      } else {
        e++;
      }
    }
    w /= (p1.data.connections.length - e);
    if (p1.data.connections.length < p2.data.connections.length) {
      e += p2.data.connections.length - p1.data.connections.length;
    }

    return (cE * e) + (cW * w);
  }


  // ---------------------------------------------------------------------


  CreateObjects() {
    for (let i = 0; i < this.genepool.length; i++) {
      this.genepool[i].obj = new unit(this.genepool[i].data, this.unitSize, this.unData);
    }
    MakeFood();
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
