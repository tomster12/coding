
using UnityEngine;


public class ParticleSystemRemover : MonoBehaviour
{
    [SerializeField] private ParticleSystem ps;
    private void Update() { if (!ps.IsAlive()) Destroy(gameObject); }
}
