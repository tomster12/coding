
using System.Collections;
using UnityEngine;


[CreateAssetMenu(fileName = "Slash Jab Knife Spawner", menuName = "Spawners/Slash Jab Knife")]
public class SlashJabKnifeSpawner : EnemySpawner
{
    // Declare config
    [SerializeField] private GameObject knifePfb;
    [SerializeField] private Vector3 initialPos;
    [SerializeField] private float spawnSpread;
    [SerializeField] private SlashKnifeSettings knifeSettings;


    protected override void Attack()
    {
        // Spawn knife
        Vector3 offset = Vector3.forward * (Random.Range(0, spawnSpread * 2.0f) - spawnSpread);
        GameObject knifeGO = GameObject.Instantiate(knifePfb, initialPos + offset, Quaternion.Euler(0.0f, 0.0f, 90.0f));
        knifeGO.GetComponent<SlashKnife>().Initialize(pcr, knifeSettings);
        attacks.Add(knifeGO);
    }
}
