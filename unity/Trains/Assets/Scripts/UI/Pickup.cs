using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Pickup : MonoBehaviour {

  // Declare variables
  public ParticleSystem pickupVFX;

  private Vector3 startScale;
  public int amount { get; private set; }


  public void Start() {
    // Initialize variables
    startScale = transform.localScale;
  }



  public void Update() {
    // Update scale based on sin wave
    float wave = 0.97f + 0.03f * Mathf.Sin((Time.time / 2f) * (2.0f * Mathf.PI));
    transform.localScale = startScale * wave;
  }


  public void setAmount(int newAmount) {
    // Update amount
    amount = newAmount;
  }


  public void pickup() {
    // Has been picked up
    pickupVFX.Emit(10);
    pickupVFX.transform.parent = null;
    Destroy(gameObject);
  }
}
