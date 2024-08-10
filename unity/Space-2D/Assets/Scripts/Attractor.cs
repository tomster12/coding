using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Attractor : MonoBehaviour {

  // #region - Setup

  // Declare preset variables
  [SerializeField]
  private Vector2 initialVelocity;

  // Declare variables
  public Rigidbody2D rb;


  public void Awake() {
    // Initialize variables
    rb = GetComponent<Rigidbody2D>();
  }


  public void Start() {
    // Initialize if necessary then add to static list
    Universe.attractors.Add(this);
    rb.velocity = initialVelocity;
  }

  // #endregion


  // #region - Main

  void FixedUpdate() {
    attractOthers();
  }


  private void attractOthers() {
    // Attract each other attract towards this
    foreach (Attractor attractor in Universe.attractors) {
      if (attractor != this) {
        Rigidbody2D otherRB = attractor.rb;
        Vector2 direction = rb.position - otherRB.position;
        float forceMagnitude = Universe.G * (rb.mass * otherRB.mass) / direction.sqrMagnitude;
        Vector2 force = direction.normalized * forceMagnitude;
        otherRB.AddForce(force);
      }
    }
  }

  // #endregion
}
