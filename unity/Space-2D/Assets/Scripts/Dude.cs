using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Dude : MonoBehaviour, IControllable {

  // #region - Setup

  // Declare preset variables
  [SerializeField]
  private float movementSpeed;
  [SerializeField]
  private float rotationSpeed;
  [SerializeField]
  private ParticleSystem[] movementEmitters;
  [SerializeField]
  private ParticleSystem[] rotationEmitters;

  // Declare variables
  private Rigidbody2D rb;


  public void Awake() {
    // Initialize variables
    rb = GetComponent<Rigidbody2D>();
  }

  // #endregion


  // #region - Main

  public void inputMovementDirection(Vector2 movementDirection) {
    // Activate each movement emitter based on movement direction
    foreach (ParticleSystem emitter in movementEmitters) {
      Vector2 forceDirection = emitter.transform.right;
      float forceAmount = Vector2.Dot(forceDirection, movementDirection);
      if (forceAmount > 0) {
        if (!emitter.isPlaying) emitter.Play();
        var em = emitter.emission;
          em.rateOverTime = 30 * forceAmount;
        rb.AddForce(forceDirection * forceAmount * movementSpeed);
      } else if (emitter.isPlaying) emitter.Stop();
    }

    // Apply movement force
    rb.AddForce(movementDirection * movementSpeed);
  }


  public void inputRotationDirection(float rotation) {
    // Activate each rotation emitter based on rotation direction
    foreach (ParticleSystem emitter in rotationEmitters) {
      Vector2 forceDirection = emitter.transform.right;
      Vector2 clockwiseVector = Vector2.Perpendicular((Vector2)emitter.transform.position - rb.position);
      if (Mathf.Sign(Vector2.Dot(clockwiseVector, forceDirection)) != Mathf.Sign(rotation) && rotation != 0) {
        if (!emitter.isPlaying) emitter.Play();
        rb.AddForceAtPosition(forceDirection * rotationSpeed, emitter.transform.position);
      } else if (emitter.isPlaying) emitter.Stop();
    }
  }

  // #endregion
}
