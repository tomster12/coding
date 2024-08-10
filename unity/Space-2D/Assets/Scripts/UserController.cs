using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UserController : MonoBehaviour {

  // #region - Setup

  // Declare preset variables
  [SerializeField]
  private float movementSpeed;

  // Declare variables
  private Camera camera;
  private float targetZoom;
  private Transform followedTransform;
  private IControllable controlledI;


  public void Awake() {
    // Initialize variables
    camera = GetComponent<Camera>();
    targetZoom = camera.orthographicSize;
    followedTransform = null;
    controlledI = null;
  }

  // #endregion


  // #region - Main

  public void Update() {
    handleInput();
    updateCamera();
  }


  private void handleInput() {
    // Zoom in / out using scrollwheel
    targetZoom += Input.GetAxis("Mouse ScrollWheel") * -2.0f;
    targetZoom = Mathf.Clamp(targetZoom, 0.5f, 8.0f);
    camera.orthographicSize = Mathf.Lerp(camera.orthographicSize, targetZoom, Time.deltaTime * 10.0f);

    // Move using horizontal and vertical input axis
    Vector3 inputVector = new Vector3(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"), 0);
    float rotationDirection = (Input.GetKey("q") ? 1 : 0) + (Input.GetKey("e") ? -1 : 0);

    // Pass through to controlled object
    if (controlledI != null) {
      controlledI.inputMovementDirection((Vector2)inputVector);
      controlledI.inputRotationDirection(rotationDirection); }

    // Move directly using input
    else transform.position = transform.position + inputVector * movementSpeed;

    // Click on objects to select
    if (Input.GetMouseButtonDown(0)) {
      Vector3 mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
      RaycastHit2D hit = Physics2D.Raycast((Vector2)mousePos, Vector2.zero);

      // Select / deselect based on whether clicked on object
      if (hit.collider != null) selectObject(hit.transform.gameObject);
      else deselectObject();
    }
  }


  private void updateCamera() {
    // Follow objects with the camera
    if (followedTransform != null) {
      Vector3 followedPosition = new Vector3(
        followedTransform.position.x,
        followedTransform.position.y, -50);
      transform.position = followedPosition;
    }
  }


  private void selectObject(GameObject obj) {
    // Follow / control a selected object
    followedTransform = obj.transform;
    controlledI = obj.GetComponent<IControllable>();
  }


  private void deselectObject() {
    // Remove currently followed / controlled object
    followedTransform = null;
    controlledI = null;
  }

  // #endregion
}
