
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class NeuralAgent : MonoBehaviour, IGeneticAgent<NeuralNetwork> {

  // Declare variables
  [SerializeField] private Material mat1;
  [SerializeField] private Material mat2;
  private BallMovement ball;
  private MeshRenderer renderer;
  private NeuralNetwork net;
  private Transform target;

  private float _cachedFitness = 0.0f;
  private bool _fitnessCached = false;
  private bool running;
  private float timeLeft;
  private float timeTouching;


  public void Awake() {
    // Get variables
    ball = GetComponent<BallMovement>();
    renderer = GetComponent<MeshRenderer>();
    renderer.material = mat1;
  }


  public void initAgent(NeuralNetwork net_, Transform target_) {
    // Initialize variables
    if (net_ == null) net = new NeuralNetwork(new int[] { 2, 3, 3, 2 });
    else net = net_;
    target = target_;

    _cachedFitness = 0.0f;
    _fitnessCached = false;
    running = false;
    timeLeft = 30.0f;
    timeTouching = 0.0f;
  }


  public void Update() {
    if (target == null) return;

    // Turn off when finished
    if (running && getFinished()) running = false;

    // Run neural network and move ball
    if (running) {
      Vector3 diff = target.position - transform.position;
      float[] input = new float[] { diff.x, diff.y };
      float[] output = net.getOutput(input);
      ball.inputMovement(output[0] * Time.deltaTime, output[1] * Time.deltaTime);
      timeLeft -= Time.deltaTime;

      if (diff.magnitude <= 1.1f) {
        timeTouching += Time.deltaTime;
        renderer.material = mat2;
      } else renderer.material = mat1;
    }
  }


  public float getFitness() {
    // Fitness been calculated
    if (_fitnessCached) return _cachedFitness;

    // Recalculate fitness as function based on distance
    else {
      _cachedFitness = (timeTouching * timeTouching * 0.1f) + 1.0f / (target.position - transform.position).magnitude;
      if (getFinished()) _fitnessCached = true;
      return _cachedFitness;
    }
  }


  public void destroyAgent() { Destroy(gameObject); }

  public void startAgent() { running = true; }

  public void stopAgent() { running = false; }

  public void updateAgent() { Update(); }

  public bool getFinished() { return timeLeft <= 0.0f; }

  public void setBrain(NeuralNetwork newNet) { net = newNet; }

  public NeuralNetwork getBrain() { return net; }
}
