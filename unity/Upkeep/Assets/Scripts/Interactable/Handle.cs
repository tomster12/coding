
using UnityEngine;


public class Handle : MonoBehaviour
{
    // Declare references, variables
    [Header("References")]
    [SerializeField] private Outline outline;
    [SerializeField] private Color outlineHoverColor;
    [SerializeField] private Color outlineGrabColor;

    public bool isHovered { get; private set; }
    public bool isGrabbed { get; private set; }

    
    private void Update()
    {
        // Update whether grabbed
        if (isHovered && Input.GetMouseButtonDown(0)) isGrabbed = true;
        else if (!Input.GetMouseButton(0)) isGrabbed = false;

        // Update highlighting
        if (outline != null)
        {
            if (isGrabbed) outline.OutlineColor = outlineGrabColor;
            else outline.OutlineColor = outlineHoverColor;
            outline.enabled = isHovered || isGrabbed;
        }
    }


    public float GetGrabAngle()
    {
        // Raycast mouse onto plane
        Plane p = new Plane(transform.up, transform.position);
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        p.Raycast(ray, out float enter);
     
        // Get angle to mouse from grabbable and return
        Vector3 dir = ray.GetPoint(enter) - transform.position;
        float angle = Mathf.Max(0, Vector3.SignedAngle(transform.forward, dir, transform.up));
        return angle;
    }


    private void OnMouseOver() => isHovered = true;
    private void OnMouseExit() => isHovered = false;
}
