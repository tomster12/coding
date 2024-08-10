
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class VectorBrain : IGeneticBrain<VectorBrain> {

  // Declare variables
  public int current { get; private set; }
  public int count { get; private set; }
  private Vector3[] vectors;


  public VectorBrain(int newCount) {
    // Initialize variables
    current = 0;
    count = newCount;
    vectors = new Vector3[count];

    // Initialize vectors
    for (int i = 0; i < count; i++) {
      vectors[i] = new Vector3(Random.Range(-1.0f, 1.0f), 0, Random.Range(-1.0f, 1.0f));
    }
  }


  public VectorBrain(Vector3[] newVectors) {
    // Initialize variables
    current = 0;
    count = newVectors.Length;
    vectors = newVectors;
  }


  public Vector3 getNext() {
    // Return next vector in list
    if (current < count) {
      current++;
      return vectors[current - 1];
    } else return Vector3.zero;
  }


  public int getLeft() {
    // Return how many vectors left
    return count - current;
  }


  public VectorBrain crossover(VectorBrain otherBrain) {
    // Ensure counts are the same
    if (count != otherBrain.count) Debug.LogError("Error: List sizes do not match.");

    // Create new vector list based on both vector lists
    Vector3[] newVectors = new Vector3[count];
    for (int i = 0; i < count; i++) {
      float r = Random.Range(0.0f, 1.0f);
      if (r < 0.5f) newVectors[i] = vectors[i];
      else newVectors[i] = otherBrain.vectors[i];
    }

    // Create new vector list
    VectorBrain newBrain = new VectorBrain(newVectors);
    return newBrain;
  }


  public void mutate(float mutationRate) {
    // Mutate each vector based on mutation rate
    for (int i = 0; i < count; i++) {
      float r = Random.Range(0.0f, 1.0f);
      if (r < mutationRate) vectors[i] = new Vector3(Random.Range(-1.0f, 1.0f), 0, Random.Range(-1.0f, 1.0f));
    }
  }
}
