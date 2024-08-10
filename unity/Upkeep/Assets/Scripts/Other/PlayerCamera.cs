
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PlayerCamera : MonoBehaviour
{

    // Declare variables
    public Transform orbit;
    public Camera cam;

    public float rotateSpeed;
    public Vector3 offset = new Vector3(0, 0, 0);
    public float[] zoomRange = new float[] { -35.0f, -3.5f };


    private void Update()
    {
        // Rotate based on mouse Moveset
        if (Input.GetMouseButton(1))
        {
            orbit.Rotate(0, Input.GetAxis("Mouse X") * rotateSpeed, 0, Space.World);
            orbit.Rotate(-Input.GetAxis("Mouse Y") * rotateSpeed, 0, 0, Space.Self);
        }

        // Zoom in / out based on scroll wheel
        if (zoomRange != null)
        {
            float scroll = Input.GetAxis("Mouse ScrollWheel");
            if (scroll != 0)
            {
                Vector3 local = cam.transform.localPosition;
                local.z = Mathf.Clamp(local.z * (1 - scroll), zoomRange[0], zoomRange[1]);
                cam.transform.localPosition = local;
            }
        }
    }
}
