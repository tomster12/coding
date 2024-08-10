
using UnityEngine;

    
[CreateAssetMenu(fileName = "Aim Jab Knife Spawner", menuName = "Spawners/Aim Jab Knife")]
public class AimJabKnifeSpawner : EnemySpawner
{
    // Declare config
    [SerializeField] private GameObject knifePfb;
    [SerializeField] private float spawnDistance;
    [SerializeField] private JabKnifeSettings knifeSettings;


    protected override void Attack()
    {
        // Create knife object at a random position and start
        GameObject knifeGO = GameObject.Instantiate(knifePfb);
        float angle = UnityEngine.Random.Range(0.0f, 360.0f);
        Vector3 pos = pcr.transform.position + new Vector3(Mathf.Cos(angle), 0.0f, Mathf.Sin(angle)) * spawnDistance;
        knifeGO.transform.position = pos;
        knifeGO.GetComponent<JabKnife>().Initialize(pcr, knifeSettings);
        attacks.Add(knifeGO);
    }
}
