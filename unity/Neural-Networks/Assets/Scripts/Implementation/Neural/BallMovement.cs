
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class BallMovement : MonoBehaviour {

  // Declare variables
  private Rigidbody rb;


  public void Awake() {
    // Get variables
    rb = GetComponent<Rigidbody>();
  }


  public void inputMovement(float vx, float vz) {
    // Add force to rigidbody based on input
    rb.AddForce(new Vector3(vx, 0, vz), ForceMode.VelocityChange);
  }
}