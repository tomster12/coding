
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;


// Made following this tutorial: https://www.youtube.com/watch?v=qqOAzn05fvk&t=128s
// This follow this algorithm (FABRIK): https://www.youtube.com/watch?v=UNoX65PRehA

// bonePositions does not use the "root Space"
//    this means it may not correctly rotate based on the root rotation
//    not fully tested yet
//    only benefit being ease of reading / less complex

public class OldFabrikIKNoRS : MonoBehaviour {

  // Declare config, variables
  public int chainLength = 2;
  public Transform target;
  public Transform pole;

  [Header("Solver Parameters")]
  public int iterations = 10;
  public float delta = 0.01f;
  [Range(0, 1)] public float snapBackStrength = 1.0f;

  private Transform[] bones;
  private float[] boneLengths;
  private float totalLength;
  private Vector3[] bonePositions;

  private Vector3[] initialBoneDirections;
  private Quaternion[] initialBoneRotations;
  private Quaternion initialTargetRotation;
  private Transform root;


  public void Awake() {
    init();
  }


  private void init() {
    // Init root
    root = transform;
    for (int i = 0; i <= chainLength; i++) {
      if (root == null)
        throw new UnityException("The chain value is longer than the ancestor chain!");
      root = root.parent;
    }

    // Init target
    if (target == null) {
      target = new GameObject(gameObject.name + " IK Target").transform;
      target.position = transform.position;
    }
    initialTargetRotation = target.rotation;

    // Initialize variables
    bones = new Transform[chainLength + 1];
    bonePositions = new Vector3[chainLength + 1];
    boneLengths = new float[chainLength];
    initialBoneDirections = new Vector3[chainLength + 1];
    initialBoneRotations = new Quaternion[chainLength + 1];

    // Loop through to init directions, rotations, and lengths
    totalLength = 0;
    Transform current = transform;
    for (int i = bones.Length - 1; i >= 0; i--) {
      bones[i] = current;
      initialBoneRotations[i] = current.rotation;

      // End bone - calculate distances and rotation
      if (i == bones.Length - 1) {
        initialBoneDirections[i] = target.position - current.position;

      // Mid bone - calculate distances and rotation
      } else {
        initialBoneDirections[i] = bones[i + 1].position - current.position;
        boneLengths[i] = initialBoneDirections[i].magnitude;
        totalLength += boneLengths[i];
      }

      // Move upwards to parent
      current = current.parent;
    }
  }


  public void LateUpdate() {
    resolveIK();
  }


  private void resolveIK() {
    // Re-init if changed chainLength
    if (chainLength != boneLengths.Length) init();

    // Exit out if no target
    if (target == null) return;


    // Get positions
    for (int i = 0; i < bones.Length; i++)
      bonePositions[i] = bones[i].position;


    // If cannot directly reach, straighten towards target
    Vector3 targetDir = target.position - bonePositions[0];
    if (targetDir.sqrMagnitude >= totalLength * totalLength) {
      targetDir = targetDir.normalized;
      for (int i = 0; i < bonePositions.Length - 1; i++) {
        bonePositions[i + 1] = bonePositions[i] + targetDir * boneLengths[i];
      }


    // If can directly reach
    } else {

      // Snap back
      for (int i = 0; i < bonePositions.Length - 1; i++)
        bonePositions[i + 1] = Vector3.Lerp(bonePositions[i + 1], bonePositions[i] + initialBoneDirections[i], snapBackStrength);

      // Iteratively solve
      for (int itr = 0; itr < iterations; itr++) {

        // Backwards kinematics - going backwards, drag each bone to next
        for (int i = bonePositions.Length - 1; i > 0; i--) {
          if (i == bonePositions.Length - 1) bonePositions[i] = target.position;
          else {
            Vector3 backDir = (bonePositions[i] - bonePositions[i + 1]).normalized;
            bonePositions[i] = bonePositions[i + 1] + backDir * boneLengths[i];
          }
        }

        // Forwards kinematics - going forward, drag each bone to previous
        for (int i = 1; i < bonePositions.Length; i++) {
          Vector3 fwDir = (bonePositions[i] - bonePositions[i - 1]).normalized;
          bonePositions[i] = bonePositions[i - 1] + fwDir * boneLengths[i - 1];
        }

        // Reached target so break
        if ((bonePositions[chainLength] - target.position).sqrMagnitude < delta * delta) break;
      }
    }


    // Rotate intermediate bones towards pole
    if (pole != null) {
      Vector3 polePosition = pole.position;
      for (int i = 1; i < bonePositions.Length - 1; i++) {
        Plane plane = new Plane(bonePositions[i + 1] - bonePositions[i - 1], bonePositions[i - 1]);
        Vector3 projectedPole = plane.ClosestPointOnPlane(polePosition);
        Vector3 projectedBone = plane.ClosestPointOnPlane(bonePositions[i]);
        float angle = Vector3.SignedAngle(projectedBone - bonePositions[i - 1], projectedPole - bonePositions[i - 1], plane.normal);
        bonePositions[i] = Quaternion.AngleAxis(angle, plane.normal) * (bonePositions[i] - bonePositions[i - 1]) + bonePositions[i - 1];
      }
    }


    // Set positions and rotations
    for (int i = 0; i < bones.Length; i++) {
      Quaternion rotation;
      if (i == bones.Length - 1)
        rotation = target.rotation * Quaternion.Inverse(initialTargetRotation) * initialBoneRotations[i];
      else rotation = Quaternion.FromToRotation(initialBoneDirections[i], bonePositions[i + 1] - bonePositions[i]) * initialBoneRotations[i];
      bones[i].position = bonePositions[i];
      bones[i].rotation = rotation;
    }
  }


  public void OnDrawGizmos() {
    // Loop upwards through transforms
    Transform current = transform;
    for (int i = 0; i < chainLength && current != null && current.parent != null; i++) {

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
}
