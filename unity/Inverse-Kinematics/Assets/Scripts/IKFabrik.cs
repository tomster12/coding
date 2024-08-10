
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;


// Uses RootSpace for default fallbacks:
// - boneDir for snapback
// - boneRot for rotation

public class IKFabrik : MonoBehaviour {

  // Declare references, config, variables
  [Header("Options")]
  [SerializeField] private Transform root;
  [SerializeField] private Transform end;
  [SerializeField] private Transform target;
  [SerializeField] private Transform pole;

  [Header("Solver")]
  [SerializeField] private int iterations = 10;
  [SerializeField] private float delta = 0.01f;
  [SerializeField] [Range(0, 1)] private float snapBackStrength = 1.0f;

  private int boneCount;
  private Transform[] bones;
  private float[] boneLengths;
  public float totalLength { get; private set; }

  private Vector3[] initBoneDirRS;
  private Quaternion[] initBoneRotRS;
  private Quaternion initTargetRotRS;


  private void Awake() { initIK(); }


  private void initIK() {
    // Ensure there is a target
    if (target == null) {
      target = new GameObject(gameObject.name + " IK Target").transform;
      setPositionRS(target, getPositionRS(end));
    }

    // Calculate arm Length
    boneCount = 0;
    Transform current = end;
    while (current != root) {
      boneCount++;
      current = current.parent;
      if (current == null) throw new UnityException("Could not find start.");
    }

    // Declare bone variables
    bones = new Transform[boneCount];
    boneLengths = new float[boneCount - 1];
    totalLength = 0.0f;

    initBoneDirRS = new Vector3[boneCount];
    initBoneRotRS = new Quaternion[boneCount];
    initTargetRotRS = getRotationRS(target);

    // Loop over all bones
    current = end;
    for (int i = boneCount - 1; i >= 0; i--) {
      bones[i] = current;
      current = current.parent;

      // Update bone position, rotation, direction, length
      initBoneRotRS[i] = getRotationRS(bones[i]);
      if (bones[i] == end) {
        initBoneDirRS[i] = getPositionRS(target) - getPositionRS(bones[i]);
      } else {
        initBoneDirRS[i] = getPositionRS(bones[i + 1]) - getPositionRS(bones[i]);
        boneLengths[i] = initBoneDirRS[i].magnitude;
        totalLength += boneLengths[i];
      }
    }
  }


  public void LateUpdate() { resolveIK(); }


  private void resolveIK() {
    // Get positions and rotations
    Vector3[] nextBonePosRS = new Vector3[boneCount];
    for (int i = 0; i < bones.Length; i++)
      nextBonePosRS[i] = getPositionRS(bones[i]);
    Vector3 currentTargetPositionRS = getPositionRS(target);
    Quaternion currentTargetRotationRS = getRotationRS(target);


    // If cannot directly reach, straighten towards target
    Vector3 targetDirRS = currentTargetPositionRS - nextBonePosRS[0];
    if (targetDirRS.sqrMagnitude >= (totalLength * totalLength)) {
      targetDirRS = targetDirRS.normalized;
      for (int i = 0; i < boneCount - 1; i++) {
        nextBonePosRS[i + 1] = nextBonePosRS[i] + targetDirRS * boneLengths[i];
      }

    // Otherwise, apply inverse kinematics
    } else {

      // Apply snap back
      for (int i = 0; i < boneCount - 1; i++) {
        nextBonePosRS[i + 1] = Vector3.Lerp(nextBonePosRS[i + 1], nextBonePosRS[i] + initBoneDirRS[i], snapBackStrength);
      }

      // Iteratively solve
      for (int itr = 0; itr < iterations; itr++) {

        // Backwards kinematics: going backwards, drag each bone to next
        for (int i = boneCount - 1; i > 0; i--) {
          if (i == boneCount - 1) {
            nextBonePosRS[i] = currentTargetPositionRS;
          } else {
            Vector3 backDir = (nextBonePosRS[i] - nextBonePosRS[i + 1]).normalized;
            nextBonePosRS[i] = nextBonePosRS[i + 1] + backDir * boneLengths[i];
          }
        }

        // Forwards kinematics: going forward, pull each bone to previous
        for (int i = 1; i < boneCount; i++) {
          Vector3 fwDir = (nextBonePosRS[i] - nextBonePosRS[i - 1]).normalized;
          nextBonePosRS[i] = nextBonePosRS[i - 1] + fwDir * boneLengths[i - 1];
        }

        // Reached target so break
        if ((nextBonePosRS[boneCount - 1] - currentTargetPositionRS).sqrMagnitude < (delta * delta)) break;
      }
    }

    // Rotate intermediate bones towards pole
    if (pole != null) {
      Vector3 polePosition = getPositionRS(pole);
      for (int i = 1; i < nextBonePosRS.Length - 1; i++) {
        Plane plane = new Plane(nextBonePosRS[i + 1] - nextBonePosRS[i - 1], nextBonePosRS[i - 1]);
        Vector3 projectedPole = plane.ClosestPointOnPlane(polePosition);
        Vector3 projectedBone = plane.ClosestPointOnPlane(nextBonePosRS[i]);
        float angle = Vector3.SignedAngle(projectedBone - nextBonePosRS[i - 1], projectedPole - nextBonePosRS[i - 1], plane.normal);
        nextBonePosRS[i] = Quaternion.AngleAxis(angle, plane.normal) * (nextBonePosRS[i] - nextBonePosRS[i - 1]) + nextBonePosRS[i - 1];
      }
    }


    // Set positions and rotations
    for (int i = 0; i < boneCount; i++) {
      if (bones[i] == end)
        setRotationRS(bones[i], Quaternion.Inverse(currentTargetRotationRS) * initTargetRotRS * Quaternion.Inverse(initBoneRotRS[i]));
      else setRotationRS(bones[i], Quaternion.FromToRotation(initBoneDirRS[i], nextBonePosRS[i + 1] - nextBonePosRS[i]) * Quaternion.Inverse(initBoneRotRS[i]));
      setPositionRS(bones[i], nextBonePosRS[i]);
    }
  }


  public void OnDrawGizmos() {
    // Loop upwards through transforms
    Transform current = end;
    for (int i = 0; i < boneCount && current != null && current.parent != null; i++) {

      // Get vectors and distances
      Vector3 dir = current.parent.position - current.position;
      float scale = dir.magnitude * 0.1f;

      // Setup matrix then draw wireframe to parent
      Handles.matrix = Matrix4x4.TRS(current.position, Quaternion.FromToRotation(Vector3.up, dir), new Vector3(scale, dir.magnitude, scale));
      Handles.color = Color.green;
      Handles.DrawWireCube(Vector3.up * 0.5f, Vector3.one);

      // Move upwards to parent
      current = current.parent;
    }
  }


  public Transform getTarget() { return target; }


  // #region - RootSpace Setters / Getters

  private Vector3 getPositionRS(Transform current) {
    if (root == null) return current.position;
    else return Quaternion.Inverse(root.rotation) * (current.position - root.position);
  }

  private void setPositionRS(Transform current, Vector3 position) {
    if (root == null) current.position = position;
    else current.position = root.rotation * position + root.position;
  }

  private Quaternion getRotationRS(Transform current) {
    //inverse(after) * before => rot: before -> after
    if (root == null) return current.rotation;
    else return Quaternion.Inverse(current.rotation) * root.rotation;
  }

  private void setRotationRS(Transform current, Quaternion rotation) {
    if (root == null) current.rotation = rotation;
    else current.rotation = root.rotation * rotation;
  }

  // #endregion
}
