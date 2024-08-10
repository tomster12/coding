
using UnityEngine;


public class OneShot : MonoBehaviour
{
    // Declare variables
    [SerializeField] private AudioSource audioSrc;


    private void Update()
    {
        if (!audioSrc.isPlaying) Destroy(gameObject);
    }


    public void Play(AudioClip clip) => audioSrc.PlayOneShot(clip);
}
