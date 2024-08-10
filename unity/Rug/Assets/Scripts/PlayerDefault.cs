
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PlayerDefault : MonoBehaviour
{

    // Declare references, config
    protected PlayerCamera cam;
    protected PlayerController controller;
    protected Animator animator;
    private Transform body;
    private Rigidbody rb;

    [SerializeField] private float moveSpeed = 1.5f;
    [SerializeField] private float jumpForce = 2.0f;

    private Transform aimTf;
    private bool toJump;


    protected virtual void Awake()
    {
        cam = FindObjectOfType<PlayerCamera>();
        controller = GetComponent<PlayerController>();
        animator = GetComponent<Animator>();
        body = transform.Find("Body");
        rb = GetComponent<Rigidbody>();
    }


    protected virtual void Update()
    {
        HandleInput();
    }

    private void HandleInput()
    {
        // Aim and jump
        toJump = toJump || Input.GetKeyDown("space");
        aimTf = cam.getAimingTransform();
        body.rotation = aimTf.rotation;

    }


    protected virtual void FixedUpdate()
    {
        UpdateMovement();
    }

    private void UpdateMovement()
    {
        // Rotate player body towards camera forward, and body towards mouse
        Vector3 flatForward = cam.getAimingForwardFlat();
        controller.Rotate(Quaternion.LookRotation(flatForward));

        // Move based on horizontal / vertical axis
        float moveX = Input.GetAxisRaw("Horizontal");
        float moveY = Input.GetAxisRaw("Vertical");
        Vector3 inputDir = transform.right * moveX + transform.forward * moveY;
        Vector3 movementDir = inputDir.normalized * moveSpeed * Time.fixedDeltaTime;
        controller.SimpleMove(movementDir);

        // Update player movement / rotation
        animator.SetBool("isMoving", inputDir != Vector3.zero);

        // Update jumping
        if (controller.isGrounded && toJump)
            rb.AddForce(Vector3.up * jumpForce, ForceMode.VelocityChange);
        toJump = false;
    }


    public Transform GetCentre()
    {
        // Return centre part
        return body;
    }
}
