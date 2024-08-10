
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;


// Made following this tutorial: https://www.youtube.com/watch?v=qqOAzn05fvk&t=128s
// This follow this algorithm (FABRIK): https://www.youtube.com/watch?v=UNoX65PRehA

// bonePositions works in "root Space"
//    this means each point is rotated / offset as if the root is the frame of reference
//    to accomodate, root space setters / getters for rotation have been used

public class OldFabrikIK : MonoBehaviour {

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
  private Vector3[] bonePositions;
  private float totalLength;

  [SerializeField] private Vector3[] initialBoneDirections;
  [SerializeField] private Quaternion[] initialBoneRotations;
  [SerializeField] private Quaternion initialTargetRotation;
  [SerializeField] private Transform root;


  public void Awake() {
    init();
  }


  private void init() {
    // Initialize variables
    bones = new Transform[chainLength + 1];
    boneLengths = new float[chainLength];
    bonePositions = new Vector3[chainLength + 1];

    initialBoneDirections = new Vector3[chainLength + 1];
    initialBoneRotations = new Quaternion[chainLength + 1];

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
      setPositionRS(target, getPositionRS(transform));
    }
    initialTargetRotation = getRotationRS(target);

    // Loop through to init directions, rotations, and lengths
    totalLength = 0;
    Transform current = transform;
    for (int i = bones.Length - 1; i >= 0; i--) {
      bones[i] = current;
      initialBoneRotations[i] = getRotationRS(current);

      // End bone - calculate distances and rotation
      if (i == bones.Length - 1) {
        initialBoneDirections[i] = getPositionRS(target) - getPositionRS(current);

      // Mid bone - calculate distances and rotation
      } else {
        initialBoneDirections[i] = getPositionRS(bones[i + 1]) - getPositionRS(current);
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
    // Exit out if no target
    if (target == null) return;

    // Re-init if changed chainLength
    if (chainLength != boneLengths.Length) init();

    // Get positions and rotations
    for (int i = 0; i < bones.Length; i++)
      bonePositions[i] = getPositionRS(bones[i]);
    Vector3 targetPosition = getPositionRS(target);
    Quaternion targetRotation = getRotationRS(target);

    // If cannot directly reach, straighten towards target
    Vector3 targetDir = targetPosition - bonePositions[0];
    if (targetDir.sqrMagnitude >= totalLength * totalLength) {
      // targetDir = targetDir.normalized;
      // for (int i = 0; i < bonePositions.Length - 1; i++)
      //   bonePositions[i + 1] = bonePositions[i] + targetDir * boneLengths[i];

    } else {
      // Apply snap back
      for (int i = 0; i < bonePositions.Length - 1; i++)
      bonePositions[i + 1] = Vector3.Lerp(bonePositions[i + 1], bonePositions[i] + initialBoneDirections[i], snapBackStrength);

      // Iteratively solve
      for (int itr = 0; itr < iterations; itr++) {

        // Backwards kinematics - going backwards, drag each bone to next
        for (int i = bonePositions.Length - 1; i > 0; i--) {
          if (i == bonePositions.Length - 1) bonePositions[i] = targetPosition;
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
    // if (pole != null) {
    //   Vector3 polePosition = getPositionRS(pole);
    //   for (int i = 1; i < bonePositions.Length - 1; i++) {
    //     Plane plane = new Plane(bonePositions[i + 1] - bonePositions[i - 1], bonePositions[i - 1]);
    //     Vector3 projectedPole = plane.ClosestPointOnPlane(polePosition);
    //     Vector3 projectedBone = plane.ClosestPointOnPlane(bonePositions[i]);
    //     float angle = Vector3.SignedAngle(projectedBone - bonePositions[i - 1], projectedPole - bonePositions[i - 1], plane.normal);
    //     bonePositions[i] = Quaternion.AngleAxis(angle, plane.normal) * (bonePositions[i] - bonePositions[i - 1]) + bonePositions[i - 1];
    //   }
    // }


    // Set positions and rotations
    for (int i = 0; i < bonePositions.Length; i++) {
      // if (i == bonePositions.Length - 1)
      //   setRotationRS(bones[i], Quaternion.Inverse(targetRotation) * initialTargetRotation * Quaternion.Inverse(initialBoneRotations[i]));
      // else setRotationRS(bones[i], Quaternion.FromToRotation(initialBoneDirections[i], bonePositions[i + 1] - bonePositions[i]) * Quaternion.Inverse(initialBoneRotations[i]));
      setPositionRS(bones[i], bonePositions[i]);
    }
  }


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
