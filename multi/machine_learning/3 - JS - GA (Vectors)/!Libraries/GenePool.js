
class GenePool {

  constructor(mutationChance_) {
    // Initialize variables
    this.mutationChance = mutationChance_;

    this.agents = [];
    this.agentCount = 0;
    this.currentGeneration = 1;
    this.currentBest = Number.MAX_VALUE;
    this.isRunning = false;

    this.autoStart = false;
    this.instantRun = false;
    this.showAgents = 2;
    this.showDebug = true;
    this.logDebug = false;
  }


  addAgent(agent) {
    // Add agent and increase agentCount
    this.agents.push(agent);
    this.agentCount++;
  }


  update() {
    // Handle input
    if (input.keys.clicked[32]) { ga.isRunning = !ga.isRunning; console.log("Toggled running: " + ga.isRunning); }
    if (input.keys.clicked[81]) { ga.autoStart = !ga.autoStart; console.log("Toggled auto start: " + ga.autoStart); }
    if (input.keys.clicked[87]) { ga.instantRun = !ga.instantRun; console.log("Toggled instant run: " + ga.instantRun); }
    if (input.keys.clicked[69]) { ga.showAgents = (ga.showAgents + 1) % 3; console.log("Incremented show agents: " + ga.showAgents); }
    if (input.keys.clicked[82]) { ga.showDebug = !ga.showDebug; console.log("Toggled show debug: " + ga.showDebug); }
    if (input.keys.clicked[84]) { ga.logDebug = !ga.logDebug; console.log("Toggled log debug: " + ga.logDebug); }


    // Check if the genepool is running
    if (!this.isRunning && this.autoStart) this.isRunning = true;
    if (this.isRunning) {
      let hasFinished = false;


      // Instantly complete generation
      if (this.instantRun) {
        while (!hasFinished) {
          hasFinished = true;

          // Loop over and update all agents
          for (let agent of this.agents) {
            agent.update();
            hasFinished = !agent.isComplete() ? false : hasFinished;
          }
        }


      // Update once a frame
      } else {
        hasFinished = true;

        // Loop over and update all agents
        for (let agent of this.agents) {
          agent.update();
          hasFinished = !agent.isComplete() ? false : hasFinished;
        }
      }


      // Check if completed
      if (hasFinished) this.finishGeneration();
    }


    // Show agents
    if (this.agentCount > 0) {
      if (this.showAgents == 1) this.agents[0].show();
      else if (this.showAgents == 2) {
        for (let agent of this.agents) agent.show();
      }
    }

    // Show debug
    if (this.showDebug) {
      noStroke();
      fill(0);
      textSize(14);
      text("(SPACE) Is running: " + ga.isRunning, 10, 20);
      text("(Q) Auto start: " + ga.autoStart, 10, 40);
      text("(W) Instant run: " + ga.instantRun, 10, 60);
      text("(E) Show agents: " + ga.showAgents, 10, 80);
      text("(R) Show debug: " + ga.showDebug, 10, 100);
      text("(T) Log debug: " + ga.logDebug, 10, 120);
      text("current generation: " + ga.currentGeneration, 10, 160);
      text("current best: " + ga.currentBest, 10, 180);
    }
  }


  finishGeneration() {
    // Sort agents based on score
    if (this.logDebug) console.log("- Sorting agents...");
    this.agents.sort((a, b) => a.getScore() - b.getScore());
    this.currentBest = this.agents[this.agents.length - 1].getScore();
    if (this.logDebug) console.log("Best score: " + this.currentBest);

    // Cull bottom half of agents
    if (this.logDebug) console.log("- Culling agents...");
    this.agents.splice(0, this.agentCount / 2);
    if (this.logDebug) console.log("Now have " + this.agents.length + " agents");

    // Calculate sum and setup helper function
    if (this.logDebug) console.log("- Summing score...");
    let sum = this.agents.reduce((acc, a) => (acc + a.getScore()), 0);
    if (this.logDebug) console.log("Sum score: " + sum);
    let pickAgent = (value) => {
      let localSum = 0;
      for (let agent of this.agents) {
        localSum += agent.getScore();
        if (localSum >= value) return agent;
      }
      return this.agents[this.agents.length - 1];
    }

    // Populate a new set of agents using crossover
    if (this.logDebug) console.log("- Creating new agents...");
    let newAgents = [];
    while (newAgents.length < this.agentCount) {
      let agent1 = pickAgent(random() * sum);
      // TODO: Ensure same agent isnt picked multiple times
      let agent2 = pickAgent(random() * sum);
      newAgents.push(agent1.crossover(agent2));
    }
    if (this.logDebug) console.log("New agents count: " + newAgents.length);

    // Randomize some agents movements
    for (let i = 0; i < newAgents; i++) {
      if (random() < this.mutationChance) newAgents[i].mutate();
    }

    // Setup new agents and update variables
    if (this.logDebug) console.log("Finished generation " + this.currentGeneration);
    if (this.logDebug) console.log("------")
    this.agents = newAgents;
    this.currentGeneration++;
    this.isRunning = false;
  }
}


class GeneticAgent {

  constructor() { }

  update() { }

  show() { }

  isComplete() { return true; }

  getScore() { return -1; }

  crossover(other) { return new GeneticAgent(); }

  mutate() { }
}
