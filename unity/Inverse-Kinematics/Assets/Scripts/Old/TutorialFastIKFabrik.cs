#if UNITY_EDITOR
using UnityEditor;
#endif
using UnityEngine;

namespace DitzelGames.FastIK
{
    /// <summary>
    /// Fabrik IK Solver
    /// </summary>
    public class TutorialFastIKFabrik : MonoBehaviour
    {
        /// <summary>
        /// Chain length of bones
        /// </summary>
        public int chainLength = 2;

        /// <summary>
        /// target the chain should bent to
        /// </summary>
        public Transform target;
        public Transform pole;

        /// <summary>
        /// Solver iterations per update
        /// </summary>
        [Header("Solver Parameters")]
        public int iterations = 10;

        /// <summary>
        /// Distance when the solver stops
        /// </summary>
        public float delta = 0.001f;

        /// <summary>
        /// Strength of going back to the start position.
        /// </summary>
        [Range(0, 1)]
        public float snapBackStrength = 1f;


        protected float[] boneLengths; //target to Origin
        protected float totalLength;
        protected Transform[] bones;
        protected Vector3[] bonePositions;
        protected Vector3[] initialBoneDirections;
        protected Quaternion[] initialBoneRotations;
        protected Quaternion initialTargetRotation;
        protected Transform root;


        // Start is called before the first frame update
        void Awake()
        {
            Init();
        }

        void Init()
        {
            //initial array
            bones = new Transform[chainLength + 1];
            bonePositions = new Vector3[chainLength + 1];
            boneLengths = new float[chainLength];
            initialBoneDirections = new Vector3[chainLength + 1];
            initialBoneRotations = new Quaternion[chainLength + 1];

            //find root
            root = transform;
            for (var i = 0; i <= chainLength; i++)
            {
                if (root == null)
                    throw new UnityException("The chain value is longer than the ancestor chain!");
                root = root.parent;
            }

            //init target
            if (target == null)
            {
                target = new GameObject(gameObject.name + " target").transform;
                SetPositionRootSpace(target, GetPositionRootSpace(transform));
            }
            initialTargetRotation = GetRotationRootSpace(target);


            //init data
            var current = transform;
            totalLength = 0;
            for (var i = bones.Length - 1; i >= 0; i--)
            {
                bones[i] = current;
                initialBoneRotations[i] = GetRotationRootSpace(current);

                if (i == bones.Length - 1)
                {
                    //leaf
                    initialBoneDirections[i] = GetPositionRootSpace(target) - GetPositionRootSpace(current);
                }
                else
                {
                    //mid bone
                    initialBoneDirections[i] = GetPositionRootSpace(bones[i + 1]) - GetPositionRootSpace(current);
                    boneLengths[i] = initialBoneDirections[i].magnitude;
                    totalLength += boneLengths[i];
                }

                current = current.parent;
            }



        }

        // Update is called once per frame
        void LateUpdate()
        {
            ResolveIK();
        }

        private void ResolveIK()
        {
            if (target == null)
                return;

            if (boneLengths.Length != chainLength)
                Init();

            //Fabric

            //  root
            //  (bone0) (bonelen 0) (bone1) (bonelen 1) (bone2)...
            //   x--------------------x--------------------x---...

            //get position
            for (int i = 0; i < bones.Length; i++)
                bonePositions[i] = GetPositionRootSpace(bones[i]);

            var targetPosition = GetPositionRootSpace(target);
            var targetRotation = GetRotationRootSpace(target);

            //1st is possible to reach?
            if ((targetPosition - GetPositionRootSpace(bones[0])).sqrMagnitude >= totalLength * totalLength)
            {
                //just strech it
                var direction = (targetPosition - bonePositions[0]).normalized;
                //set everything after root
                for (int i = 1; i < bonePositions.Length; i++)
                    bonePositions[i] = bonePositions[i - 1] + direction * boneLengths[i - 1];
            }
            else
            {
              for (int i = 0; i < bonePositions.Length - 1; i++)
                bonePositions[i + 1] = Vector3.Lerp(bonePositions[i + 1], bonePositions[i] + initialBoneDirections[i], snapBackStrength);

              for (int iteration = 0; iteration < iterations; iteration++)
              {
                //https://www.youtube.com/watch?v=UNoX65PRehA
                //back
                for (int i = bonePositions.Length - 1; i > 0; i--)
                {
                    if (i == bonePositions.Length - 1)
                        bonePositions[i] = targetPosition; //set it to target
                    else
                        bonePositions[i] = bonePositions[i + 1] + (bonePositions[i] - bonePositions[i + 1]).normalized * boneLengths[i]; //set in line on distance
                }

                //forward
                for (int i = 1; i < bonePositions.Length; i++)
                  bonePositions[i] = bonePositions[i - 1] + (bonePositions[i] - bonePositions[i - 1]).normalized * boneLengths[i - 1];

                //close enough?
                if ((bonePositions[bonePositions.Length - 1] - targetPosition).sqrMagnitude < delta * delta)
                  break;
              }
            }

            //move towards pole
            if (pole != null)
            {
                var polePosition = GetPositionRootSpace(pole);
                for (int i = 1; i < bonePositions.Length - 1; i++)
                {
                    var plane = new Plane(bonePositions[i + 1] - bonePositions[i - 1], bonePositions[i - 1]);
                    var projectedPole = plane.ClosestPointOnPlane(polePosition);
                    var projectedBone = plane.ClosestPointOnPlane(bonePositions[i]);
                    var angle = Vector3.SignedAngle(projectedBone - bonePositions[i - 1], projectedPole - bonePositions[i - 1], plane.normal);
                    bonePositions[i] = Quaternion.AngleAxis(angle, plane.normal) * (bonePositions[i] - bonePositions[i - 1]) + bonePositions[i - 1];
                }
            }

            //set position & rotation
            for (int i = 0; i < bonePositions.Length; i++)
            {
                if (i == bonePositions.Length - 1)
                    SetRotationRootSpace(bones[i], Quaternion.Inverse(targetRotation) * initialTargetRotation * Quaternion.Inverse(initialBoneRotations[i]));
                else
                    SetRotationRootSpace(bones[i], Quaternion.FromToRotation(initialBoneDirections[i], bonePositions[i + 1] - bonePositions[i]) * Quaternion.Inverse(initialBoneRotations[i]));
                SetPositionRootSpace(bones[i], bonePositions[i]);
            }
        }

        private Vector3 GetPositionRootSpace(Transform current)
        {
            if (root == null)
                return current.position;
            else
                return Quaternion.Inverse(root.rotation) * (current.position - root.position);
        }

        private void SetPositionRootSpace(Transform current, Vector3 position)
        {
            if (root == null)
                current.position = position;
            else
                current.position = root.rotation * position + root.position;
        }

        private Quaternion GetRotationRootSpace(Transform current)
        {
            //inverse(after) * before => rot: before -> after
            if (root == null)
                return current.rotation;
            else
                return Quaternion.Inverse(current.rotation) * root.rotation;
        }

        private void SetRotationRootSpace(Transform current, Quaternion rotation)
        {
            if (root == null)
                current.rotation = rotation;
            else
                current.rotation = root.rotation * rotation;
        }

        void OnDrawGizmos()
        {
#if UNITY_EDITOR
            var current = this.transform;
            for (int i = 0; i < chainLength && current != null && current.parent != null; i++)
            {
                var scale = Vector3.Distance(current.position, current.parent.position) * 0.1f;
                Handles.matrix = Matrix4x4.TRS(current.position, Quaternion.FromToRotation(Vector3.up, current.parent.position - current.position), new Vector3(scale, Vector3.Distance(current.parent.position, current.position), scale));
                Handles.color = Color.green;
                Handles.DrawWireCube(Vector3.up * 0.5f, Vector3.one);
                current = current.parent;
            }
#endif
        }

    }
}