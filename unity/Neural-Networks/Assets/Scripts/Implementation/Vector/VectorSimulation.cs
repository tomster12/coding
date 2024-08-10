
using System;
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class VectorSimulation : MonoBehaviour, GenepoolHandler {

  // Declare variables
  [Header("Config")]
  public GameObject agentPF;
  public Transform start;
  public int setAgentCount = 100;
  public float setMutationRate = 0.05f;

  [Header("Variables")]
  public bool autoFinish = false;
  public bool autoStart = false;
  public bool instantRun = false;
  private Genepool<VectorBrain> genepool;


  public void Start() {
    // Intialize genepool
    genepool = new Genepool<VectorBrain>(setAgentCount, setMutationRate, createAgent, generationFinished);
  }


  public void Update() {
    // Handle instant finish
    while (instantRun && genepool.getRunning() && !genepool.getFinished()) genepool.runGeneration();

    // Handle auto start / finish
    if (autoFinish && genepool.getRunning() && genepool.getFinished()) genepool.finishGeneration();
    if (autoStart && !genepool.getRunning()) genepool.startGeneration();
  }


  private VectorAgent createAgent(VectorBrain brain_) {
    // Initialize game object
    GameObject agentGO = GameObject.Instantiate(agentPF);
    Vector3 position = start.position;
    agentGO.transform.position = position;
    agentGO.transform.parent = transform;

    // Setup agent script
    VectorAgent agent = agentGO.GetComponent<VectorAgent>();
    agent.initAgent(brain_);
    return agent;
  }


  private void generationFinished() {}


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