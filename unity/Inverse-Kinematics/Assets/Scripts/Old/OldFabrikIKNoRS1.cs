
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;


public class OldFabrikIKNoRS1 : MonoBehaviour {

  // Declare references, config, variables
  [Header("Options")]
  [SerializeField] private Transform target;
  [SerializeField] private Transform pole;
  [SerializeField] private Transform start;
  [SerializeField] private Transform end;

  [Header("Solver")]
  [SerializeField] private int iterations = 10;
  [SerializeField] private float delta = 0.01f;
  [SerializeField] [Range(0, 1)] private float snapBackStrength = 1.0f;

  private int boneCount;
  private Transform[] bones;
  private float[] boneLengths;
  private float totalLength;

  private Vector3[] initBoneDir;
  private Quaternion[] initBoneRot;
  private Quaternion initTargetRot;


  private void Awake() { initIK(); }


  private void initIK() {
    // Ensure there is a target
    if (target == null) {
      target = new GameObject(gameObject.name + " IK Target").transform;
      target.position = end.position;
      target.parent = transform.parent;
    }

    // Calculate arm Length
    boneCount = 0;
    Transform current = end;
    while (true) {
      boneCount++;
      if (current == start) break;
      else current = current.parent;
      if (current == null) throw new UnityException("Could not find start.");
    }

    // Declare bone variables
    bones = new Transform[boneCount];
    boneLengths = new float[boneCount - 1];
    totalLength = 0.0f;

    initBoneDir = new Vector3[boneCount];
    initBoneRot = new Quaternion[boneCount];
    initTargetRot = target.rotation;

    // Loop over all bones
    current = end;
    for (int i = boneCount - 1; i >= 0; i--) {
      bones[i] = current;
      current = current.parent;

      // Update bone position, rotation, direction, length
      initBoneRot[i] = bones[i].rotation;
      if (bones[i] == end) {
        initBoneDir[i] = target.position - bones[i].position;
      } else {
        initBoneDir[i] = bones[i + 1].position - bones[i].position;
        boneLengths[i] = initBoneDir[i].magnitude;
        totalLength += boneLengths[i];
      }
    }
  }


  public void LateUpdate() { resolveIK(); }


  private void resolveIK() {
    // Setup next positions
    Vector3[] nextBonePos = new Vector3[boneCount];
    Quaternion[] nextBoneRot = new Quaternion[boneCount];
    for (int i = 0; i < bones.Length; i++) nextBonePos[i] = bones[i].position;


    // If cannot directly reach, straighten towards target
    Vector3 targetDir = target.position - nextBonePos[0];
    if (targetDir.sqrMagnitude >= (totalLength * totalLength)) {
      targetDir = targetDir.normalized;
      for (int i = 0; i < boneCount - 1; i++) {
        nextBonePos[i + 1] = nextBonePos[i] + targetDir * boneLengths[i];
      }


    // Otherwise, apply inverse kinematics
    } else {

      // Apply snap back
      for (int i = 0; i < boneCount - 1; i++) {
        nextBonePos[i + 1] = Vector3.Lerp(nextBonePos[i + 1], nextBonePos[i] + initBoneDir[i], snapBackStrength);
      }

      // Iteratively solve
      for (int itr = 0; itr < iterations; itr++) {

        // Backwards kinematics: going backwards, drag each bone to next
        for (int i = boneCount - 1; i > 0; i--) {
          if (i == boneCount - 1) {
            nextBonePos[i] = target.position;
          } else {
            Vector3 backDir = (nextBonePos[i] - nextBonePos[i + 1]).normalized;
            nextBonePos[i] = nextBonePos[i + 1] + backDir * boneLengths[i];
          }
        }

        // Forwards kinematics: going forward, pull each bone to previous
        for (int i = 1; i < boneCount; i++) {
          Vector3 fwDir = (nextBonePos[i] - nextBonePos[i - 1]).normalized;
          nextBonePos[i] = nextBonePos[i - 1] + fwDir * boneLengths[i - 1];
        }

        // Reached target so break
        if ((nextBonePos[boneCount - 1] - target.position).sqrMagnitude < (delta * delta)) break;
      }
    }


    // Rotate intermediate bones towards pole
    if (pole != null) {
      for (int i = 1; i < nextBonePos.Length - 1; i++) {
        Plane plane = new Plane(nextBonePos[i + 1] - nextBonePos[i - 1], nextBonePos[i - 1]);
        Vector3 projectedPole = plane.ClosestPointOnPlane(pole.position);
        Vector3 projectedBone = plane.ClosestPointOnPlane(nextBonePos[i]);
        float angle = Vector3.SignedAngle(projectedBone - nextBonePos[i - 1], projectedPole - nextBonePos[i - 1], plane.normal);
        nextBonePos[i] = Quaternion.AngleAxis(angle, plane.normal) * (nextBonePos[i] - nextBonePos[i - 1]) + nextBonePos[i - 1];
      }
    }


    // Set positions and rotations
    for (int i = 0; i < boneCount; i++) {

      // if (bones[i] != end)
      //   bones[i].rotation = Quaternion.FromToRotation(initBoneDir[i], nextBonePos[i + 1] - nextBonePos[i]) * Quaternion.Inverse(initBoneRot[i]);

      if (bones[i] != end)
        bones[i].rotation = Quaternion.FromToRotation(bones[i + 1].position - bones[i].position, nextBonePos[i + 1] - nextBonePos[i]) * bones[i].rotation;

      bones[i].position = nextBonePos[i];
    }
  }


  public void OnDrawGizmos() {
    // Loop upwards through transforms
    for (int i = 0; i < boneCount - 1; i++) {

      // Setup matrix then draw wireframe to parent
      Vector3 dir = bones[i + 1].position - bones[i].position;
      float scale = dir.magnitude * 0.1f;
      Handles.matrix = Matrix4x4.TRS(bones[i].position, Quaternion.FromToRotation(Vector3.up, dir), new Vector3(scale, dir.magnitude, scale));
      Handles.color = Color.green;
      Handles.DrawWireCube(Vector3.up * 0.5f, Vector3.one);
      Debug.DrawRay(bones[i].position, bones[i].up, Color.red);
    }
  }
}