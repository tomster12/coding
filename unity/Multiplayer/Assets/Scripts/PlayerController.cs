
using UnityEngine;
using Unity.Netcode;


public class PlayerController : NetworkBehaviour
{
    // Declare variables
    [SerializeField] private float moveSpeed = 1.5f;
    NetworkVariable<Vector3> _position = new NetworkVariable<Vector3>();
    NetworkVariable<Quaternion> _rotation = new NetworkVariable<Quaternion>();
    private Vector2 input;
    private Quaternion aimDir;


    override public void OnNetworkSpawn()
    {
        // Update local values on server update
        _position.OnValueChanged += UpdateLocalPosition;
        _rotation.OnValueChanged += UpdateLocalRotation;

        if (!IsOwner) return;

        // Update player camera
        CameraController.instance.SetPlayer(this);
    }


    private void Update()
    {
        if (!IsOwner) return;

        // Get user input
        input = new Vector2(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"));
    }


    public void Aim(Quaternion aimDir_) => aimDir = aimDir_;


    private void FixedUpdate()
    {
        if (!IsOwner) return;

        // Tell server to update movement
        if (input != Vector2.zero)
        {
            UpdateMovementServerRpc(input, aimDir);
        }
    }


    [ServerRpc]
    private void UpdateMovementServerRpc(Vector2 input, Quaternion aimDir)
    {
        // Update server calculations
        CalculateMovement(input, aimDir, out Vector3 newPos, out Quaternion newRot);
        _position.Value = newPos;
        _rotation.Value = newRot;
    }

    private void CalculateMovement(Vector2 input, Quaternion aimDir, out Vector3 newPos, out Quaternion newRot)
    {
        // Calculate rotation
        Quaternion _newRot = Quaternion.AngleAxis(aimDir.eulerAngles.y, transform.up);
        transform.rotation = _newRot;
        newRot = _newRot;

        // Calculate movement
        Vector3 _moveDir = transform.forward * input.y + transform.right * input.x;
        Vector3 _newPos = transform.position + _moveDir * moveSpeed * Time.fixedDeltaTime;
        transform.position = _newPos;
        newPos = _newPos;
    }


    private void UpdateLocalPosition(Vector3 oldPos, Vector3 newPos) => transform.position = newPos;
    private void UpdateLocalRotation(Quaternion oldRot, Quaternion newRot) => transform.rotation = newRot;
}
