
using UnityEngine;


public class Room : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private Transform floor;
    [SerializeField] private Transform wallXp;
    [SerializeField] private Transform wallZm;
    [SerializeField] private Transform wallXm;
    [SerializeField] private Transform wallZp;

    [SerializeField] private int roomSize = 2;
    [SerializeField] private float gridScale = 0.4f;


    [ContextMenu("Generate")]
    private void Generate()
    {
        floor.localScale = Vector3.one * (gridScale * roomSize) / 5.0f;

        wallXp.localScale = new Vector3(gridScale / 5.0f, 1.0f, gridScale * roomSize / 5.0f);
        wallXp.localPosition = (Vector3.right * gridScale * roomSize) + (Vector3.up * gridScale);

        wallZm.localScale = new Vector3(gridScale / 5.0f, 1.0f, gridScale * roomSize / 5.0f);
        wallZm.localPosition = (Vector3.back * gridScale * roomSize) + (Vector3.up * gridScale);

        wallXm.localScale = new Vector3(gridScale / 5.0f, 1.0f, gridScale * roomSize / 5.0f);
        wallXm.localPosition = (Vector3.left * gridScale * roomSize) + (Vector3.up * gridScale);

        wallZp.localScale = new Vector3(gridScale / 5.0f, 1.0f, gridScale * roomSize / 5.0f);
        wallZp.localPosition = (Vector3.forward * gridScale * roomSize) + (Vector3.up * gridScale);
    }
}
