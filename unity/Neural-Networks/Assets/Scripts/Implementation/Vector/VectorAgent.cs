
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class VectorAgent : MonoBehaviour, IGeneticAgent<VectorBrain> {

  // Declare variables
  private VectorBrain brain;
  private Transform target;

  private float _cachedFitness = 0.0f;
  private bool _fitnessCached = false;
  private bool running;
  private bool reached;
  private int reachedLeft;


  public void Awake() {
    // Get variables
    target = GameObject.Find("Target").transform;
  }


  public void initAgent(VectorBrain brain_) {
    // Initialize variables
    if (brain_ == null) brain = new VectorBrain(100);
    else brain = brain_;

    _cachedFitness = 0.0f;
    _fitnessCached = false;
    running = false;
    reached = false;
    reachedLeft = -1;
  }


  public void Update() {
    if (target == null) return;

    // Turn off when finished
    if (running && getFinished()) running = false;

    // Get next vector from brain
    if (running) {
      Vector3 next = brain.getNext();
      transform.position += next * 0.35f;

      if ((target.position - transform.position).magnitude <= 1.0f) {
        reached = true;
        reachedLeft = brain.getLeft();
      }
    }
  }


  public float getFitness() {
    // Fitness been calculated
    if (_fitnessCached) return _cachedFitness;

    // Recalculate fitness as function based on distance
    else {
      if (reached) _cachedFitness = 2.0f + ((float)reachedLeft / brain.count) * 2.0f;
      else _cachedFitness = 1.0f / (target.position - transform.position).magnitude;
      if (getFinished()) _fitnessCached = true;
      return _cachedFitness;
    }
  }


  public void destroyAgent() { Destroy(gameObject); }

  public void startAgent() { running = true; }

  public void stopAgent() { running = false; }

  public void updateAgent() { Update(); }

  public bool getFinished() { return brain.getLeft() == 0 || reached; }

  public void setBrain(VectorBrain newBrain) { brain = newBrain; }

  public VectorBrain getBrain() { return brain; }
}
