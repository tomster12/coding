
using UnityEngine;
using UnityEngine.UI;


public class Warning : MonoBehaviour
{
    // Declare config, variables
    [Header("References")]
    [SerializeField] private SpriteRenderer sprite;

    [Header("Config")]
    [SerializeField] private AnimationCurve positionCurve;
    [SerializeField] private AnimationCurve sizeCurve;
    [SerializeField] private AnimationCurve opacityCurve;
    [SerializeField] private float duration = 2.0f;

    private Vector3 initialPosition;
    private Vector3 initialSize;
    private float time;


    private void Awake()
    {
        // Initialize variables
        initialPosition = transform.position;
        initialSize = transform.localScale;
    }


    private void Update()
    {
        // Update position / size / opacity
        float pct = time / duration;
        float yOffset = positionCurve.Evaluate(pct);
        transform.position = new Vector3(initialPosition.x, initialPosition.y + yOffset, initialPosition.z);
        transform.localScale = initialSize * sizeCurve.Evaluate(pct);
        sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, opacityCurve.Evaluate(pct));

        // Look at camera
        transform.LookAt(Camera.main.transform, Vector3.up);

        // Update time and delete if needed
        time += Time.deltaTime;
        if (time > duration) Destroy(gameObject);
    }
}
