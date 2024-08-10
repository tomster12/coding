
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class IKLegs : MonoBehaviour {

  // Declare static, preset, config, variables
  private static float RAY_OFFSET = 40.0f;

  [HeaderAttribute("References")]
  [SerializeField] private Transform body;
  [SerializeField] private IKFabrik[] legs;
  private Transform globalIKContainer;
  private Transform localIKContainer;
  private Transform[] legTargets;
  private Transform[] legCurrents;
  private Transform[] legBases;

  [HeaderAttribute("Movement")]
  [SerializeField] private float bodyMovementSpeed = 10.0f;
  [SerializeField] private float bodyRotationSpeed = 40.0f;
  [SerializeField] private float legMovementSpeed = 10.0f;
  private float bodyHeight = 5.0f;
  private bool moving = false;
  private float movingTimer = 0.0f;
  private float movingTimerMax = 1.0f;
  private Vector3 movingPrevPos = Vector3.zero;
  private Vector3 movingDir = Vector3.zero;

  [HeaderAttribute("Config")]
  [SerializeField] private float legReachAmount = 0.35f;


  private void Start() {
    // Initialize variables
    globalIKContainer = new GameObject().transform;
    globalIKContainer.name = "Global IK (" + transform.name + ")";

    localIKContainer = new GameObject().transform;
    localIKContainer.parent = body;
    localIKContainer.name = "Local IK (" + transform.name + ")";

    legTargets = new Transform[legs.Length];
    legBases = new Transform[legs.Length];
    legCurrents = new Transform[legs.Length];

    for (int i = 0; i < legs.Length; i++) {
      legTargets[i] = legs[i].getTarget();
      legTargets[i].parent = globalIKContainer;

      legBases[i] = new GameObject().transform;
      legBases[i].position = legTargets[i].position;
      legBases[i].parent = localIKContainer;
      legBases[i].name = "Leg IK Base";

      legCurrents[i] = new GameObject().transform;
      legCurrents[i].position = legTargets[i].position;
      legCurrents[i].parent = globalIKContainer;
      legCurrents[i].name = "Leg IK Current";
    }

    bodyHeight = body.position.y;
    movingPrevPos = body.position;
    movingDir = Vector3.zero;
  }


  private void Update() {
    handlePosition();
    handleIK();
  }


  private void handlePosition() {
    // Input movement with input
    Vector3 movementInpDir = Vector3.zero;
    float movementInpRot = 0.0f;
    movementInpDir += Input.GetAxis("Vertical") * transform.forward * bodyMovementSpeed;
    movementInpRot += Input.GetAxis("Horizontal") * bodyRotationSpeed;
    transform.position += movementInpDir * Time.deltaTime;
    transform.eulerAngles = transform.eulerAngles + new Vector3(0.0f, movementInpRot, 0.0f) * Time.deltaTime;

    // Handle moving state
    if (movementInpDir.magnitude != 0.0f || movementInpRot != 0.0f) {
      movingDir = transform.forward * Mathf.Sign(Vector3.Dot(body.position - movingPrevPos, transform.forward));
      movingTimer = movingTimerMax;
      moving = true;
    }
    if (moving && movingTimer > 0.0f) {
      movingTimer -= Time.deltaTime;
      if (movingTimer <= 0.0f) {
        moving = false;
        movingTimer = 0.0f;
      }
    }
    movingPrevPos = body.position;
  }


  private void handleIK() {
    // Return to base when not moving
    if (!moving) {
      for (int i = 0; i < legs.Length; i++) legCurrents[i].position = legBases[i].position;

    } else {
      // Update leg pair positions
      for (int i = 0; i < legs.Length; i++) {
        int pairIndex = (i - i % 2) + (1 - i % 2);
        float legReach = legs[i].totalLength * legReachAmount;
        float stretch = Vector3.Dot(legCurrents[i].position - legBases[i].position, movingDir);
        float pairStretch = Vector3.Dot(legCurrents[pairIndex].position - legBases[pairIndex].position, movingDir);

        // Handle if legs are behind / in front of reach
        if (stretch > (legReach + 0.01f)) legCurrents[i].position = legBases[i].position + (movingDir * -legReach);
        else if (stretch < -(legReach + 0.01f)) legCurrents[i].position = legBases[i].position + (movingDir * legReach);

        // Handle if both legs same side of body
        else if (Mathf.Sign(stretch) == Mathf.Sign(pairStretch) && Mathf.Abs(stretch) > (legReach * 0.05f)) {
          if (stretch < 0 && ((i % 2) == (Mathf.Floor(i / 2) % 2))) legCurrents[i].position = legBases[i].position + (movingDir * (legReach + pairStretch));
          else if (stretch >= 0 && ((i % 2) != (Mathf.Floor(i / 2) % 2))) legCurrents[i].position = legBases[i].position + (movingDir * (legReach + pairStretch));
        }
      }
    }

    // Interpolate targets to current
    for (int i = 0; i < legs.Length; i++) {
      legTargets[i].position = Vector3.Lerp(legTargets[i].position, legCurrents[i].position, legMovementSpeed * Time.deltaTime);
    }
  }
}
