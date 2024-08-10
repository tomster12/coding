
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


// Using this video: https://www.youtube.com/watch?v=e6Gjhr1IP6w

[SelectionBase]
public class OldIKLegs : MonoBehaviour {

  // Declare static, preset, config, variables
  private static float RAY_OFFSET = 100.0f;

  [HeaderAttribute("Object References")]
  public Transform[] legs;
  public Transform[] middle;
  public Transform[] next;
  public Transform body;

  [HeaderAttribute("Movement Config")]
  public float threshold = 7.0f;
  public float movementSpeed = 14.0f;
  public float landedDelta = 0.1f;

  [HeaderAttribute("Body Config")]
  public float bodyHeight = 5.0f;
  public float bodyMovementSpeed = 5.0f;
  public float bodyRotationSpeed = 5.0f;

  private Vector3 previousPos;
  private Vector3 velocity;
  private bool[] grounded;


  public void Start() {
    // Init leg variables
    grounded = new bool[legs.Length];
    for (int i = 0; i < legs.Length; i++) grounded[i] = true;
    previousPos = transform.position;
    velocity = new Vector3(0, 0);
  }


  public void Update() {
    // Update velocity
    velocity *= 0.9f;
    velocity += (transform.position - previousPos) / Time.deltaTime;
    previousPos = transform.position;

    // Run over each leg
    Vector3 totalSum = Vector3.zero;
    Vector3 leftSum = Vector3.zero;
    Vector3 rightSum = Vector3.zero;
    Vector3 backSum = Vector3.zero;
    Vector3 frontSum = Vector3.zero;

    LayerMask ground = LayerMask.GetMask("Ground");
    for (int i = 0; i < legs.Length; i++) {
      totalSum += legs[i].position;
      if (i < (legs.Length / 2))
        leftSum += legs[i].position;
      else rightSum += legs[i].position;
      if ((i % (legs.Length / 2)) >= (legs.Length / 4))
        frontSum += legs[i].position;
      else backSum += legs[i].position;

      // Check whether leg is far enough away to move
      Vector3 middleDir = middle[i].position - next[i].position;
      if (middleDir.sqrMagnitude > (threshold * threshold)) {

        // - move if opposite legs are grounded
        if (grounded[(i + 1) % legs.Length]) {
          int opposite = legs.Length - 1 - i;
          next[i].position = middle[i].position + velocity.normalized * threshold * 0.8f;
          next[opposite].position = middle[opposite].position + velocity.normalized * threshold * 0.8f;
          grounded[i] = false;
          grounded[opposite] = false;
        }
      }

      // Use raycasting to keep middle on ground
      RaycastHit middleHit;
      Vector3 middleCastStart = middle[i].position + Vector3.up * RAY_OFFSET;
      if (Physics.Raycast(middleCastStart, Vector3.down, out middleHit, RAY_OFFSET * 2.0f, ground)) {
        middle[i].position = middleHit.point;
      }

      // Use raycasting to keep next on ground
      RaycastHit nextHit;
      Vector3 nextCastStart = next[i].position + Vector3.up * RAY_OFFSET;
      if (Physics.Raycast(nextCastStart, Vector3.down, out nextHit, RAY_OFFSET * 2.0f, ground)) {
        next[i].position = nextHit.point;
      }

      // Move legs towards next
      Vector3 nextDir = next[i].position - legs[i].position;
      legs[i].position = Vector3.Slerp(legs[i].position, next[i].position, movementSpeed * Time.deltaTime);
      if (nextDir.sqrMagnitude < landedDelta * landedDelta) grounded[i] = true;
    }

    // Move body to rotation based on legs
    // Vector3 leftAv = leftSum / (legs.Length / 2);
    // Vector3 rightAv = rightSum / (legs.Length / 2);
    // Vector3 backAv = backSum / (legs.Length / 2);
    // Vector3 frontAv = frontSum / (legs.Length / 2);
    // float rollAngle = Vector3.SignedAngle(Vector3.right, rightAv - leftAv, Vector3.forward);
    // float pitchAngle = Vector3.SignedAngle(Vector3.forward, frontAv - backAv, Vector3.right);
    // body.rotation = Quaternion.AngleAxis(rollAngle, transform.forward); // * Quaternion.AngleAxis(pitchAngle, transform.right);

    // Move body to average position of legs
    // Vector3 totalAv = totalSum / legs.Length;
    // Vector3 targetPos = totalAv + Vector3.up * bodyHeight;
    // body.position = Vector3.Lerp(body.position, targetPos, bodyMovementSpeed * Time.deltaTime);
  }
}
