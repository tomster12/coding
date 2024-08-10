
using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;


public class NeuralNetwork : IGeneticBrain<NeuralNetwork> {

  // Declare variables
  public int[] layerSizes { get; private set; }
  public bool hasBias { get; private set; }
  public Matrix[] weights { get; private set; }
  public Matrix[] biasWeights { get; private set; }


  public NeuralNetwork(int[] layerSizes_, bool hasBias_=true) {
    // Initialize variables
    layerSizes = layerSizes_;
    hasBias = hasBias_;
    initWeights();
  }


  public NeuralNetwork(Matrix[] weights_, Matrix[] biasWeights_) {
    // Initialize variables
    layerSizes = new int[weights_.Length];
    for (int i = 0; i < weights_.Length; i++) layerSizes[i] = weights_[i].sx;
    hasBias = biasWeights_ != null;
    weights = weights_;
    biasWeights = biasWeights_;
  }


  private void initWeights() {
    // Create matrix for each layer of weights
    weights = new Matrix[layerSizes.Length - 1];
    biasWeights = new Matrix[layerSizes.Length - 1];
    for (int i = 0; i < layerSizes.Length - 1; i++) {

      weights[i] = new Matrix(layerSizes[i], layerSizes[i + 1]);
      weights[i].map((x, y, v) => UnityEngine.Random.Range(-1.0f, 1.0f));

      if (hasBias) {
        biasWeights[i] = new Matrix(1, layerSizes[i + 1]);
        biasWeights[i].map((x, y, v) => UnityEngine.Random.Range(-1.0f, 1.0f));
      }
    }
  }


  public float[] getOutput(float[] input) {
    // Setup input matrix
    Matrix inputMatrix = new Matrix(1, layerSizes[0]);

    // Run through weights
    Matrix current = new Matrix(input);
    for (int i = 0; i < layerSizes.Length - 1; i++) {
      Matrix next = weights[i].cross(current);
      next = next.add(biasWeights[i]);
      current = next.map((x, y, v) => tanh(v));
    }

    // Return output
    float[] final = new float[layerSizes[layerSizes.Length - 1]];
    for (int i = 0; i < current.sy; i++) final[i] = current.get(0, i);
    return final;
  }


  public NeuralNetwork crossover(NeuralNetwork otherNet) {
    // Ensure layer sizes are the same
    if (hasBias != otherNet.hasBias) Debug.LogError("Error: hasBias does not match.");
    for (int i = 0; i < layerSizes.Length; i++) {
      if (layerSizes[i] != otherNet.layerSizes[i]) Debug.LogError("Error: Layer sizes do not match.");
    }

    // Create new weights based on both nets weights
    Matrix[] newWeights = new Matrix[weights.Length];
    Matrix[] newBiasWeights = new Matrix[weights.Length];

    for (int i = 0; i < weights.Length; i++) {
      Matrix newWeight = new Matrix(weights[i].sx, weights[i].sy);
      Matrix newBiasWeight = new Matrix(biasWeights[i].sx, biasWeights[i].sy);

      newWeight.map((x, y, v) => {
        float r = UnityEngine.Random.Range(0.0f, 1.0f);
        if (r < 0.5f) return weights[i].get(x, y);
        else return otherNet.weights[i].get(x, y);
      });

      if (hasBias) {
        newBiasWeight.map((x, y, v) => {
          float r = UnityEngine.Random.Range(0.0f, 1.0f);
          if (r < 0.5f) return biasWeights[i].get(x, y);
          else return otherNet.biasWeights[i].get(x, y);
        });
      }

      newWeights[i] = newWeight;
      newBiasWeights[i] = newBiasWeight;
    }

    // Create new network
    NeuralNetwork newNet = new NeuralNetwork(newWeights, newBiasWeights);
    return newNet;
  }


  public void mutate(float mutationRate) {
    // Mutate random parts of the genome
    for (int i = 0; i < weights.Length; i++) {
      weights[i].map((x, y, v) => {
        float r = UnityEngine.Random.Range(0.0f, 1.0f);
        if (r >= mutationRate) return v;
        return UnityEngine.Random.Range(-1.0f, 1.0f);
      });
    }
  }


  public float tanh(float value) {
    // Activation function
    return (float)Math.Tanh(value);
  }
}


public class Matrix {

  // Declare variables
  private float[,] values;
  public int sx { get; private set; }
  public int sy { get; private set; }


  public Matrix(int sx_, int sy_) {
    // Initialize variables
    values = new float[sx_, sy_];
    sx = sx_;
    sy = sy_;
    map((x, y, v) => 0.0f);
  }


  public Matrix(float[] input) {
    // Initialize variables
    values = new float[1, input.Length];
    sx = 1;
    sy = input.Length;
    for (int i = 0; i < input.Length; i++) values[0, i] = input[i];
  }


  public Matrix add(Matrix other) {
    // Add together matrix values
    Matrix final = new Matrix(sx, sy);
    for (int x = 0; x < sx; x++) {
      for (int y = 0; y < sy; y++) {
        final.set(x, y, get(x, y) + other.get(x, y));
      }
    }
    return final;
  }


  public Matrix cross(Matrix other) {
    // Loop over each row / col combination and sum values
    Matrix final = new Matrix(other.sx, sy);
    for (int row = 0; row < sy; row++) {
      for (int col = 0; col < other.sx; col++) {
        float sum = 0;
        for (int val = 0; val < other.sy; val++) sum += get(val, row) * other.get(col, val);
        final.set(col, row, sum);
      }
    }
    return final;
  }


  public Matrix map(Func<int, int, float, float> mapper) {
    // Run the mapper function over all values
    for (int x = 0; x < values.GetLength(0); x++) {
      for (int y = 0; y < values.GetLength(1); y++) {
        set(x, y, mapper(x, y, get(x, y)));
      }
    }
    return this;
  }


  public void set(int x, int y, float value) { values[x, y] = value; }

  public float get(int x, int y) { return values[x, y]; }

  public int getLength(int ind) { return values.GetLength(ind); }
}
