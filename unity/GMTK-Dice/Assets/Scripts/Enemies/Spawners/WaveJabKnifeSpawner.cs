
using System.Collections;
using UnityEngine;


[CreateAssetMenu(fileName = "Wave Jab Knife Spawner", menuName = "Spawners/Wave Jab Knife")]
public class WaveJabKnifeSpawner : EnemySpawner
{
    // Declare config
    [SerializeField] private GameObject knifePfb;
    [SerializeField] private float spawnDistance;
    [SerializeField] private float spawnSpread;
    [SerializeField] private JabKnifeSettings knifeSettings;


    protected override void Attack() => pcr.StartCoroutine(AttackIE());
    private IEnumerator AttackIE()
    {
        // Create multiple knife objects and start
        float angle = UnityEngine.Random.Range(0.0f, 360.0f);
        Vector3 centrePos = pcr.transform.position + new Vector3(Mathf.Cos(angle), 0.0f, Mathf.Sin(angle)) * spawnDistance;
        Vector3 parallelDir = Vector3.Cross(centrePos - pcr.transform.position, Vector3.up).normalized;
        Quaternion dir = Quaternion.LookRotation(pcr.transform.position - centrePos, Vector3.up);

        float count = 4.0f;
        for (int i = 0; i < count; i++)
        {
            Vector3 offset = parallelDir * spawnSpread * (i / (count - 1) - 0.5f);
            GameObject knifeGO = GameObject.Instantiate(knifePfb, centrePos + offset, dir);
            knifeGO.GetComponent<JabKnife>().Initialize(pcr, knifeSettings);
            attacks.Add(knifeGO);
            yield return new WaitForSeconds(0.1f);
        }
    }
}