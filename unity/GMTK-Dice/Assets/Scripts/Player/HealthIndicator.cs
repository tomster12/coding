
using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;


public class HealthIndicator : MonoBehaviour
{
    // Declare variables
    [SerializeField] private Image image;
    [SerializeField] private Sprite[] sprites;
    
    [SerializeField] private float emphasisDuration;
    [SerializeField] private AnimationCurve emphasisCurve;

    private Vector3 initialScale;
    private int index;
    private float emphasisTimer;


    private void Awake()
    {
        // Initialize variables
        initialScale = transform.localScale;
    }


    public void ResetCount()
    {
        // Reset counter back to initial
        index = 0;
        image.sprite = sprites[index];
    }


    public void Increment()
    {
        // Update index and image
        index++;
        image.sprite = sprites[Mathf.Min(index, sprites.Length - 1)];
        emphasisTimer = emphasisDuration;
    }


    private void Update()
    {
        // Animate emphasis
        if (emphasisTimer != 0.0f)
        {
            float pct = 1.0f - emphasisTimer / emphasisDuration;
            float amt = emphasisCurve.Evaluate(pct);
            transform.localScale = initialScale * amt;
            emphasisTimer = Mathf.Max(0.0f, emphasisTimer - Time.deltaTime);
        }
    }
}
