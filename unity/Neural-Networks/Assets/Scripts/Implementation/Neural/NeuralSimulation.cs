
using System;
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class NeuralSimulation : MonoBehaviour, GenepoolHandler {

  // Declare variables
  [Header("Config")]
  public GameObject agentPF;
  public Transform target;
  public float spawnRadius = 15.0f;
  public int setAgentCount = 100;
  public float setMutationRate = 0.05f;

  [Header("Variables")]
  public bool autoFinish = false;
  public bool autoStart = false;
  public bool instantRun = false;
  private Genepool<NeuralNetwork> genepool;


  public void Start() {
    // Intialize genepool
    genepool = new Genepool<NeuralNetwork>(setAgentCount, setMutationRate, createAgent, generationFinished);
  }


  public void Update() {
    // Handle instant finish
    while (instantRun && genepool.getRunning() && !genepool.getFinished()) {
      genepool.runGeneration();
      Physics.Simulate(Time.deltaTime);
    }

    // Handle auto start / finish
    if (autoStart && !genepool.getRunning()) genepool.startGeneration();
    if (autoFinish && genepool.getRunning() && genepool.getFinished()) genepool.finishGeneration();
  }


  private NeuralAgent createAgent(NeuralNetwork net) {
    // Initialize game object
    GameObject agentGO = GameObject.Instantiate(agentPF);
    Vector3 position = new Vector3(
      UnityEngine.Random.Range(-spawnRadius, spawnRadius),
      agentGO.transform.localScale.y * 0.5f,
      UnityEngine.Random.Range(-spawnRadius, spawnRadius));
    agentGO.transform.position = position;
    agentGO.transform.parent = transform;

    // Setup agent script
    NeuralAgent agent = agentGO.GetComponent<NeuralAgent>();
    agent.initAgent(net, target);
    return agent;
  }


  private void generationFinished() {
    // Reset target position to middle
    target.position = new Vector3(0.0f, 0.5f, 0.0f);
  }


  public int getGeneration() { return genepool.generation; }
  public int getAgentCount() { return genepool.agentCount; }
  public float getMutationRate() { return genepool.mutationRate; }
  public float getBestFitness() { return genepool.bestFitness; }
  public bool getRunning() { return genepool.getRunning(); }

  public bool getAutoFinish() { return autoFinish; }
  public bool getAutoStart() { return autoStart; }
  public bool getInstantRun() { return instantRun; }
  public void setAutoFinish(bool newAutoFinish) { autoFinish = newAutoFinish; }
  public void setAutoStart(bool newAutoStart) { autoStart = newAutoStart; }
  public void setInstantRun(bool newInstantRun) { instantRun = newInstantRun; }

  public void finishGeneration() { if (genepool.getFinished()) genepool.finishGeneration(); }
  public void startGeneration() { if (!genepool.getRunning()) genepool.startGeneration(); }
  public void stopGeneration() { if (genepool.getRunning()) genepool.stopGeneration(); }
}