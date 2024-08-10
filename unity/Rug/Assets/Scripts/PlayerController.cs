
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PlayerController : MonoBehaviour
{

    // Declare enums, references, config, variables
    public enum StepState { NO_STEP, CAN_STEP, BLOCKED };

    private Transform stepTop;
    private Transform stepBottom;
    private Transform bodyCollider;
    private Rigidbody rb;

    [Header("Config")]
    [SerializeField] private bool drawDebug = true;
    [SerializeField] private float moveLerp = 2.0f;
    [SerializeField] private float rotationLerp = 3.0f;
    [SerializeField] private float stepCheckLength = 0.2f;
    [SerializeField] private float stepCheckDelta = 0.02f;
    [SerializeField] private float groundedCheckDelta = 0.02f;

    public bool isGrounded { get; private set; }
    private Vector3 lastMovement;
    private StepState stepState;


    protected virtual void Awake()
    {
        // Initialize references
        stepTop = transform.Find("Step Top");
        stepBottom = transform.Find("Step Bottom");
        bodyCollider = transform.Find("Body Collider");
        rb = GetComponent<Rigidbody>();
    }


    protected virtual void Update()
    {
        // Check whether is currently grounded with a raycast
        isGrounded = Physics.Raycast(rb.position + Vector3.up * groundedCheckDelta, Vector3.down, out RaycastHit hitGround, groundedCheckDelta * 2.0f, LayerMask.GetMask("Ground"));
    }


    public void Rotate(Quaternion rot)
    {
        // Rotate body in direction
        transform.rotation = rot;
    }


    public void SimpleMove(Vector3 movement)
    {
        // Move in movement direction
        rb.MovePosition(rb.position + movement);
        CheckStep(movement);
        lastMovement = movement;
    }


    private void CheckStep(Vector3 movement)
    {
        // Detect whether stepping
        stepState = StepState.NO_STEP;
        if (Physics.Raycast(stepBottom.position, movement.normalized, out RaycastHit hitBottom, stepCheckLength, LayerMask.GetMask("Ground")))
        {
            stepState = StepState.CAN_STEP;
            if (Physics.Raycast(stepTop.position, movement.normalized, out RaycastHit hitTop, stepCheckLength, LayerMask.GetMask("Ground")))
            {
                stepState = StepState.BLOCKED;
            }

            // Get height of step
            else
            {
                float checkDiff = Mathf.Abs(stepTop.position.y - stepBottom.position.y);
                if (Physics.Raycast(stepTop.position + movement.normalized * (hitBottom.distance + stepCheckDelta), Vector3.down, out RaycastHit hitHeight, checkDiff, LayerMask.GetMask("Ground")))
                {
                    float stepHeight = checkDiff - hitHeight.distance;
                    rb.position += Vector3.up * stepHeight;
                }
            }
        }
    }


    private void OnDrawGizmos()
    {
        if (drawDebug)
        {
            // Body collider wire cube
            if (bodyCollider != null)
            {
                Gizmos.matrix = bodyCollider.localToWorldMatrix;
                Gizmos.DrawWireCube(Vector3.zero, Vector3.one);
            }

            // Step raycast line
            if (stepBottom != null && stepTop != null)
            {
                Gizmos.matrix = Matrix4x4.identity;
                Gizmos.color = Color.green;
                if (stepState == StepState.BLOCKED || stepState == StepState.CAN_STEP) Gizmos.color = Color.red;
                Gizmos.DrawLine(stepBottom.position, stepBottom.position + lastMovement.normalized * stepCheckLength);
                if (stepState == StepState.CAN_STEP) Gizmos.color = Color.green;
                Gizmos.DrawLine(stepTop.position, stepTop.position + lastMovement.normalized * stepCheckLength);
            }

            // Draw inputDir and movementDir
            Gizmos.color = Color.blue;
            Gizmos.DrawLine(transform.position, transform.position + lastMovement);
        }
    }
}
