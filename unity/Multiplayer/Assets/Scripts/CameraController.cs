
using UnityEngine;


public class CameraController : MonoBehaviour
{
    // Declare variables
    public static CameraController instance;
    [SerializeField] private Transform centre;
    [SerializeField] private float rotSpeed = 360f;
    [SerializeField] private float scrollSpeed = 10f;
    [SerializeField] private PlayerController player;


    private void Awake()
    {
        // Singleton instance
        instance = this;
    }


    private void Update()
    {
        if (player == null) return;

        // Rotate centre
        centre.Rotate(0, Input.GetAxisRaw("Mouse X") * rotSpeed * Time.deltaTime, 0, Space.World);
        centre.Rotate(-Input.GetAxisRaw("Mouse Y") * rotSpeed * Time.deltaTime, 0, 0, Space.Self);

        // Zoom in / out
        Vector3 local = transform.localPosition;
        local.z *= (1 - Input.GetAxis("Mouse ScrollWheel") * Time.fixedDeltaTime * scrollSpeed);
        transform.localPosition = local;

        // Aim and follow player
        player.Aim(centre.transform.rotation);
        centre.transform.position = player.transform.position;
    }


    public void SetPlayer(PlayerController player_)
    {
        // Lock cursor and set player
        Cursor.lockState = CursorLockMode.Locked;
        player = player_;
    }
}
