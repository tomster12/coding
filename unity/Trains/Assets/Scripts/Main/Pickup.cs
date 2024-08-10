using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UIPickup : MonoBehaviour {

  // Declare variables
  public int amount;
  public Vector3 startScale;


  public void Start() {
    // Initialize variables
    startScale = transform.localScale;
  }



  public void Update() {
    // Update scale based on sin wave
    float wave = (0.8f + 0.4f * Mathf.Sin((Time.time / 1.5f) * (2.0f * Mathf.PI)));
    transform.localScale = startScale * wave;
  }


  public void setAmount(int newAmount) {
    // Update amount
    amount = newAmount;
  }
}
