using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PlayerController : MonoBehaviour {

  // #region - Setup

  // Declare config variables
  public float walkSpeed = 7.0f;
  public float sprintSpeed = 15.0f;
  public float walkFOV = 72.0f;
  public float sprintFOV = 85.0f;
  public float jumpForce = 13.0f;
  public float camSensitivity = 3.2f;
  private bool isSprinting = false;

  // Declare main variables
  private Rigidbody rb;
  private Camera camera;
  private Vector2 mouseDelta;
  private Vector3 movementDelta;
  private Vector2 aimedDirection;
  private bool toJump;


  public void Awake() {
    // Get camera object and lock cursor
    rb = GetComponent<Rigidbody>();
    camera = GetComponentInChildren<Camera>();
    Cursor.lockState = CursorLockMode.Locked;
	}

  // #endregion


  // #region - Main

  public void Update() {
    handleInput();
  }


  public void FixedUpdate() {
    updateMovement();
  }


  public void LateUpdate() {
    updateCamera();
  }


  private void handleInput() {
    // Update whether sprinting or not
    isSprinting = Input.GetKey("left shift");

    // Use input axis for updating movement delta
    float movementSpeed = isSprinting ? sprintSpeed : walkSpeed;
    float translation = Input.GetAxis("Vertical") * movementSpeed * Time.deltaTime;
    float straffe = Input.GetAxis("Horizontal") * movementSpeed * Time.deltaTime;
    movementDelta += transform.forward * translation + transform.right * straffe;

    // Jump on space
    if (Input.GetKeyDown("space")) toJump = true;
  }


  private void updateMovement() {
    // Move using movementDelta
    transform.position = transform.position + movementDelta;
    movementDelta = Vector3.zero;

    // Jump if toJump
    if (toJump) {
      rb.AddForce(0, jumpForce, 0, ForceMode.Impulse);
      toJump = false;
    }

    // Teleport back if fall
    if (transform.position.y < -10.0f) {
      transform.position = new Vector3(4.7f, 1.0f, -10.0f);
    }
  }


  private void updateCamera() {
    // Lerp FOV based on whether is sprinting
    float camFOV = isSprinting ? sprintFOV : walkFOV;
    camera.fieldOfView = Mathf.Lerp(camera.fieldOfView, camFOV, 10 * Time.deltaTime);

    mouseDelta = new Vector2(
      Input.GetAxisRaw("Mouse X"),
      Input.GetAxisRaw("Mouse Y"));
    aimedDirection += mouseDelta * camSensitivity;

    // Rotate camera around x axis and player around y axis
    camera.transform.localRotation = Quaternion.AngleAxis(-aimedDirection.y, Vector3.right);
    transform.localRotation = Quaternion.AngleAxis(aimedDirection.x, transform.up);
  }

  // #endregion
}
