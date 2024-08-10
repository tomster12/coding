using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;


// https://www.youtube.com/watch?v=cWpFZbjtSQg&t=168s
// https://www.youtube.com/watch?v=TkzASwVgnj8

public class Portal : MonoBehaviour {

  // #region - Setup

  // Declare present variables
  public float nearClipOffset = 0.05f;
  public float nearClipLimit = 0.2f;

  // Declare variables
  public Portal linkedPortal;
  public MeshRenderer screen;
  private Camera playerCam;
  private Camera portalCam;
  private RenderTexture viewTexture;


  public void Awake() {
    // Initialize variables
    playerCam = Camera.main;
    portalCam = GetComponentInChildren<Camera>();
    portalCam.enabled = false;

  }


  public void OnEnable() {
    // Subscribe render function
    RenderPipelineManager.beginCameraRendering += render;
  }


  public void OnDisable() {
    // Unsubscribe render function
    RenderPipelineManager.beginCameraRendering -= render;
  }

  // #endregion


  // #region - Main

  public void render(ScriptableRenderContext context, Camera camera) {
    if (camera.tag == "MainCamera") {

      // disable screen, create tex, position, render, enable screen
      screen.enabled = false;
      createViewTexture();
      var m = transform.localToWorldMatrix * linkedPortal.transform.worldToLocalMatrix * playerCam.transform.localToWorldMatrix;
      portalCam.transform.SetPositionAndRotation(m.GetColumn(3), m.rotation);
      setNearClipPlane();
      portalCam.Render();
      screen.enabled = true;
    }
  }


  private void createViewTexture() {
    // Recreate the view texture if necessary
    if (viewTexture == null || viewTexture.width != Screen.width || viewTexture.height != Screen.height) {
      if (viewTexture != null) viewTexture.Release();

      // Create new texture from camera and assign to linked portal
      viewTexture = new RenderTexture(Screen.width, Screen.height, 0);
      portalCam.targetTexture = viewTexture;
      linkedPortal.screen.material.SetTexture("_MainTex", viewTexture);
    }
  }


  void setNearClipPlane() {
    // Use custom projection matrix to align portal camera's near clip plane with the surface of the portal
    Transform clipPlane = transform;
    int dot = System.Math.Sign(Vector3.Dot(clipPlane.forward, clipPlane.position - portalCam.transform.position));
    Vector3 camSpacePos = portalCam.worldToCameraMatrix.MultiplyPoint(clipPlane.position);
    Vector3 camSpaceNormal = portalCam.worldToCameraMatrix.MultiplyVector(clipPlane.forward) * dot;
    float camSpaceDst = -Vector3.Dot(camSpacePos, camSpaceNormal) + nearClipOffset;

    // Use oblique clipping plane
    if (Mathf.Abs(camSpaceDst) > nearClipLimit) {
      Vector4 clipPlaneCameraSpace = new Vector4(camSpaceNormal.x, camSpaceNormal.y, camSpaceNormal.z, camSpaceDst);

      // Calculate matrix with player cam so that player camera settings (fov, etc) are used
      portalCam.projectionMatrix = playerCam.CalculateObliqueMatrix(clipPlaneCameraSpace);

    // Don't use oblique clip plane close to portal can cause visual artifacts
    } else portalCam.projectionMatrix = playerCam.projectionMatrix;
  }

  // #endregion
}
