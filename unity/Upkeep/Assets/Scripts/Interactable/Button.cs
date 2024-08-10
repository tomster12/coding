
using System;
using UnityEngine;


public class Button : MonoBehaviour
{
    // Declare references, variables
    [Header("References")]
    [SerializeField] private Outline outline;
    [SerializeField] MeshRenderer buttonRenderer;
    [SerializeField] private Color outlineHoverColor;
    [SerializeField] private Color outlineGrabColor;
    [SerializeField] private Color activeColor;
    [SerializeField] private Color inactiveColor;

    [Header("Config")]
    [SerializeField] private float pressedHeightScale = 0.7f;
    [SerializeField] private float scaleSpeed = 25f;

    private float baseScaleY;
    public Action onPressed = () => { };
    public bool isActive { get; private set; } = true;
    public bool isHovered { get; private set; }
    public bool isPressed { get; private set; }


    private void Start() => baseScaleY = transform.localScale.y;


    private void Update()
    {
        // Update whether pressed
        if (isHovered && Input.GetMouseButtonDown(0) && isActive)
        {
            if (!isPressed) onPressed();
            isPressed = true;
        }
        else if (!Input.GetMouseButton(0)) isPressed = false;

        // Update highlighting
        if (outline != null)
        {
            if (isPressed) outline.OutlineColor = outlineGrabColor;
            else outline.OutlineColor = outlineHoverColor;
            outline.enabled = isActive && (isHovered || isPressed);
        }

        // Update size based on pressed
        float newY = transform.localScale.y;
        if (isPressed) newY = Mathf.Lerp(transform.localScale.y, baseScaleY * pressedHeightScale, Time.deltaTime * scaleSpeed);
        else newY = Mathf.Lerp(transform.localScale.y, baseScaleY, Time.deltaTime * scaleSpeed);
        transform.localScale = new Vector3(transform.localScale.x, newY, transform.localScale.z);

        // Update buttonRenderer color
        if (isActive) buttonRenderer.material.color = activeColor;
        else buttonRenderer.material.color = inactiveColor;
    }


    public void SetActive(bool isActive_) => isActive = isActive_;


    private void OnMouseOver() => isHovered = true;
    private void OnMouseExit() => isHovered = false;
}
