
using UnityEngine;


public class CameraController : MonoBehaviour
{
    [Header("References")]
    [SerializeField] Transform orbitX;
    [SerializeField] Transform orbitY;
    [SerializeField] Camera cam;

    [Header("Config")]
    [SerializeField] float rotLerp = 12.0f;

    private float targetScale = 1.0f;
    private float currentScale = 1.0f;
    private int currentRot = 0;
    

    private void Start()
    {
        SetEulerX(GetTargetEulerX());
        SetEulerY(GetTargetEulerY());
    }


    private void Update()
    {
        if (Input.GetKeyDown("q")) currentRot = (currentRot + 1) % 4;
        if (Input.GetKeyDown("e")) currentRot = (currentRot - 1 + 4) % 4;
        SetEulerY(Mathf.LerpAngle(GetEulerY(), GetTargetEulerY(), Time.deltaTime * rotLerp));
    }


    private float GetTargetEulerX() => -30.0f;
    private float GetTargetEulerY() => 45.0f - 90.0f * currentRot;

    private float GetEulerX() => orbitX.localEulerAngles.x;
    private float GetEulerY() => orbitY.localEulerAngles.y;
    private Vector3 GetScale() => orbitX.localScale;
    
    private void SetEulerX(float rotX) => orbitX.localEulerAngles = new Vector3(rotX, 0.0f, 0.0f);
    private void SetEulerY(float rotY) => orbitY.localEulerAngles = new Vector3(0.0f, rotY, 0.0f);
    private void SetScale(Vector3 scale) => orbitX.localScale = scale;
}
