
using UnityEngine;


public class WarningMaker : MonoBehaviour
{
    // Declare static, prefabs
    public static WarningMaker instance;

    [Header("Prefabs")]
    [SerializeField] private GameObject warningPfb;
    [SerializeField] private GameObject warningAoEPfb;
    [SerializeField] private GameObject warningLinePfb;


    private void Awake()
    {
        // Initialize variables
        instance = this;   
    }


    public GameObject CreateWarning(Vector3 worldPos)
    {
        // Create warning and place in correct position
        return Instantiate(warningPfb, worldPos, Quaternion.identity);
    }

    public GameObject CreateWarningAoE(Vector3 worldPos, float size)
    {
        // Create warning and place in correct position
        CreateWarning(worldPos);
        GameObject obj = Instantiate(warningAoEPfb, worldPos, Quaternion.identity);
        obj.transform.localScale = new Vector3(size, 2.0f, size);
        return obj;
    }

    public GameObject CreateWarningLine(float z, float width)
    {
        // Create warning and place in correct position
        Vector3 worldPos = new Vector3(0.0f, 0.0f, z);
        float worldSize = 20.0f;
        int count = 4;
        float diff = worldSize / (count - 1);
        for (int i = 0; i < count; i++) CreateWarning(worldPos + Vector3.right * diff * (-count / 2.0f + 0.5f + i));
        GameObject obj = Instantiate(warningLinePfb, worldPos, Quaternion.identity);
        obj.transform.localScale = new Vector3(20.0f, 2.0f, width);
        return obj;
    }
}
