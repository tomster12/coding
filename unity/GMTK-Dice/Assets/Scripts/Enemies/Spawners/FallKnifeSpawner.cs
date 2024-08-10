
using System.Collections;
using UnityEngine;


[CreateAssetMenu(fileName = "Fall Knife Spawner", menuName = "Spawners/Fall Knife")]
public class FallKnifeSpawner : EnemySpawner
{
    // Declare config
    [SerializeField] private GameObject knifePfb;
    [SerializeField] private float spawnSpread;
    [SerializeField] private FallKnifeSettings knifeSettings;


    protected override void Attack() => pcr.StartCoroutine(AttackIE());
    private IEnumerator AttackIE()
    {
        float count = 3.0f;
        for (int i = 0; i < count; i++)
        {
            // Create knife object at a random position and start
            Vector3 pos = pcr.transform.position;
            Vector2 rand = UnityEngine.Random.insideUnitCircle * spawnSpread;
            pos.x += rand.x;
            pos.y = 0.0f;
            pos.z += rand.y;
            GameObject knifeGO = GameObject.Instantiate(knifePfb, pos, Quaternion.identity);
            knifeGO.GetComponent<FallKnife>().Initialize(pcr, knifeSettings);
            attacks.Add(knifeGO);
            yield return new WaitForSeconds(0.2f);
        }
    }
}
