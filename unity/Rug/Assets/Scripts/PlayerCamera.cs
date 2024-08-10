
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PlayerCamera : MonoBehaviour
{
    // Declare references, config
    private PlayerDefault player;
    private Transform cameraCentre;

    [SerializeField] private float rotateSpeed;


    private void Awake()
    {
        // Ensure player initialized
        player = Transform.FindObjectOfType<PlayerDefault>();
        cameraCentre = transform.parent;

        // Lock camera
        Cursor.lockState = CursorLockMode.Locked;
    }


    private void Update()
    {
        // Rotate based on mouse movement
        cameraCentre.Rotate(0, Input.GetAxis("Mouse X") * rotateSpeed, 0, Space.World);
        cameraCentre.Rotate(-Input.GetAxis("Mouse Y") * rotateSpeed, 0, 0, Space.Self);

        // Zoom in / out based on scroll wheel
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        if (scroll != 0)
        {
            Vector3 local = transform.localPosition;
            local.z *= (1 - scroll);
            transform.localPosition = local;
        }

        // Move centre to target
        cameraCentre.position = player.GetCentre().position;
    }


    public Transform getAimingTransform()
    {
        // Return transform aiming is based on
        return cameraCentre;
    }

        
    public Vector3 getAimingForwardFlat()
    {
        // Return a vector representing forward but flat
        return Vector3.ProjectOnPlane(getAimingTransform().forward, Vector3.up).normalized;
    }
}
