
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;


[System.Serializable]
public class Genepool<T> where T : IGeneticBrain<T> {

  // Declare variables
  public int generation { get; private set; }
  public int agentCount { get; private set; }
  public float mutationRate { get; private set; }
  public float bestFitness { get; private set; }
  private bool running = false;
  private bool finished = false;
  private List<IGeneticAgent<T>> agents;
  private System.Func<T, IGeneticAgent<T>> createAgent;
  private Action generationFinished;


  public Genepool(int setAgentCount, float setMutationRate, System.Func<T, IGeneticAgent<T>> createAgent_, Action generationFinished_) {
    // Initialize variables
    agentCount = setAgentCount;
    mutationRate = setMutationRate;
    createAgent = createAgent_;
    generationFinished = generationFinished_;
    resetGenepool();
  }


  private void resetGenepool() {
    // Reset variables
    generation = 0;
    running = false;
    finished = false;
    bestFitness = 0.0f;

    // Initialize all agents
    agents = new List<IGeneticAgent<T>>();
    for (int i = 0; i < agentCount; i++) agents.Add(createAgent(default(T)));
  }


  public void runGeneration() {
    if (!running) return;

    // Call update on all agents
    for (int i = 0; i < agentCount; i++) agents[i].updateAgent();
  }


  public void startGeneration() {
    if (running) return;

    // Call start on all agents
    for (int i = 0; i < agentCount; i++) agents[i].startAgent();
    running = true;
  }


  public void stopGeneration() {
    if (!running) return;

    // Call stop on all agents
    for (int i = 0; i < agentCount; i++) agents[i].stopAgent();
    running = false;
  }


  public void finishGeneration() {
    if (!finished) return;

    // Sort agents by fitness
    agents.Sort((a1,a2) => a1.getFitness().CompareTo(a2.getFitness()));

    // Sum fitness over agents
    float totalFitnessM = 0.0f;
    foreach (IGeneticAgent<T> agent in agents) {
      float fitness = agent.getFitness();
      float fitnessM = mapFitness(fitness);
      totalFitnessM += fitnessM;
      if (fitness > bestFitness) bestFitness = fitness;
    }

    // Create new generation by breeding
    List<IGeneticAgent<T>> newAgents = new List<IGeneticAgent<T>>();
    for (int i = 0; i < agentCount; i++) {
      IGeneticAgent<T> a1 = pickFromFitness(totalFitnessM);
      IGeneticAgent<T> a2 = pickFromFitness(totalFitnessM);
      T newBrain = a1.getBrain().crossover(a2.getBrain());
      newBrain.mutate(mutationRate);
      IGeneticAgent<T> agent = createAgent(newBrain);
      newAgents.Add(agent);
    }

    // Delete old generation and replace
    foreach (IGeneticAgent<T> agent in agents) agent.destroyAgent();
    agents = newAgents;

    // Update variables
    generation++;
    running = false;
    finished = false;
    generationFinished();
  }


  // Map fitness to discriminate better
  private float mapFitness(float fitness) { return fitness * fitness; }

  private IGeneticAgent<T> pickFromFitness(float totalFitnessM) {
    // Pick based on fitness
    float r = UnityEngine.Random.Range(0.0f, 1.0f);
    float cumFitnessM = 0.0f;
    foreach (IGeneticAgent<T> agent in agents) {
      float fitnessM = mapFitness(agent.getFitness());
      cumFitnessM += fitnessM / totalFitnessM;
      if (r < cumFitnessM) return agent;
    }

    // Default to first agent
    Debug.Log("ERROR: Did not pick an agent");
    return agents[0];
  }


  // Return whether currently running
  public bool getRunning() { return running; }


  public bool getFinished() {
    // Already found all agents finished
    if (finished) return true;

    // Return early false if any agent unfinished
    for (int i = 0; i < agentCount; i++) {
      if (!agents[i].getFinished()) return false;
    }

    // All agents finished
    finished = true;
    return true;
  }
}
