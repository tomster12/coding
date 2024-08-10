
using UnityEngine;


public class WindUpGun : MonoBehaviour
{
    // Declare references, variables
    [Header("Part References")]
    [SerializeField] private GameObject partBottom;
    [SerializeField] private GameObject partMain;
    [SerializeField] private GameObject partMainLeft;
    [SerializeField] private GameObject partMainRight;
    [SerializeField] private GameObject partTop;
    [SerializeField] private Handle handle;
    [SerializeField] private Button button;

    [Header("Animation Config")]
    [SerializeField] private Transform gunBasePosition;
    [SerializeField] private float topExtension = 0.2f;
    [SerializeField] private float gunShootOffset = 0.55f;
    [SerializeField] private float unwindAcc = 5f;
    [SerializeField] private float windAcc = 5f;
    [SerializeField] private float activationSpeed = 1.5f;
    [SerializeField] private float targetFollowSpeed = 3.0f;
    [SerializeField] private float gunMovementSpeed = 15.0f;

    [Header("Main Config")]
    [SerializeField] private Transform target;
    [SerializeField] private float[] limitXRot = { 0f, 14f };
    [SerializeField] private float energyWindRate = 270.0f;
    [SerializeField] private float energyUseRate = 60.0f;
    [SerializeField] private float energyExtraRate = 720.0f;
    [SerializeField] private float shootTimerMax = 1.2f;
    [SerializeField] private float shootAimThreshold = 8.0f;

    private float extraEnergyInput = 0.0f;
    private float currentEnergyAmount = 0.0f;
    private float currentWindRate = 0.0f;
    private float targetWindRate = 0.0f;
    private float targetWindAcc = 0.0f;
    private float shootTimerLeft = 0.0f, shootTimerRight = 0.0f;


    private void Start()
    {
        // Add energy on button press
        button.onPressed += () => extraEnergyInput += 300f;
    }


    private void Update()
    {
        if (!handle.isGrabbed)
        {
            if (currentEnergyAmount == 0.0f)
            {
                // move gun and top down towards base position
                partMain.transform.position = Vector3.Lerp(partMain.transform.position, gunBasePosition.position, Time.deltaTime * activationSpeed);
                partTop.transform.position = Vector3.Lerp(partTop.transform.position, gunBasePosition.position, Time.deltaTime * activationSpeed);
                Quaternion localRot = Quaternion.Euler(0.0f, partMain.transform.localRotation.eulerAngles.y, partMain.transform.localRotation.eulerAngles.z);
                partMain.transform.localRotation = Quaternion.Lerp(partMain.transform.localRotation, localRot, Time.deltaTime * activationSpeed);
            }
            else
            {
                // Move gun and top up towards extended position
                partMain.transform.position = Vector3.Lerp(partMain.transform.position, gunBasePosition.position + gunBasePosition.transform.up * topExtension, Time.deltaTime * activationSpeed);
                partTop.transform.position = Vector3.Lerp(partTop.transform.position, gunBasePosition.position + gunBasePosition.transform.up * topExtension, Time.deltaTime * activationSpeed);

                // Rotate gun towards target then limit
                Quaternion rot = Quaternion.LookRotation(target.position - partMain.transform.position, partMain.transform.up);
                partMain.transform.rotation = Quaternion.Lerp(partMain.transform.rotation, rot, Time.deltaTime * targetFollowSpeed);
                float limitedEulerX = Mathf.Max(Mathf.Min((partMain.transform.localRotation.eulerAngles.x > 180 ? partMain.transform.localRotation.eulerAngles.x - 360 : partMain.transform.localRotation.eulerAngles.x), limitXRot[1]), limitXRot[0]);
                partMain.transform.localRotation = Quaternion.Euler(limitedEulerX, partMain.transform.localRotation.eulerAngles.y, 0.0f);

                // Shoot left / right on timer alternating
                if (Quaternion.Angle(partMain.transform.rotation, rot) < shootAimThreshold)
                {
                    if (shootTimerLeft == 0.0f && (shootTimerRight >= 0.0f && shootTimerRight < shootTimerMax * 0.5f)) shootLeft();
                    if (shootTimerRight == 0.0f && (shootTimerLeft > 0.0f && shootTimerLeft < shootTimerMax * 0.5f)) shootRight();
                }

                // Slowly unwind and remove energy
                targetWindRate = -energyUseRate; targetWindAcc = unwindAcc;
            }

        }
        else
        {
            // Wind up using the handle when dragged in correct direction
            if (handle.GetGrabAngle() > 1f)
                { targetWindRate = energyWindRate; targetWindAcc = windAcc; }
            else { targetWindRate = 0.0f; targetWindAcc = unwindAcc; }
        }


        // Update gun left / right timers
        shootTimerLeft = Mathf.Max(0.0f, shootTimerLeft - Time.deltaTime);
        shootTimerRight = Mathf.Max(0.0f, shootTimerRight - Time.deltaTime);
            
        // Handle gun left / right standard positions
        Vector3 leftTargetOffset = Vector3.back * gunShootOffset * (shootTimerLeft == 0.0f ? 0.0f : (shootTimerLeft / shootTimerMax));
        Vector3 rightTargetOffset = Vector3.back * gunShootOffset * (shootTimerLeft == 0.0f ? 0.0f : (shootTimerRight / shootTimerMax));
        partMainLeft.transform.localPosition = Vector3.Lerp(partMainLeft.transform.localPosition, leftTargetOffset, Time.deltaTime * gunMovementSpeed);
        partMainRight.transform.localPosition = Vector3.Lerp(partMainRight.transform.localPosition, rightTargetOffset, Time.deltaTime * gunMovementSpeed);


        // Use extra energy (override)
        if (extraEnergyInput > 0.0f) { targetWindRate = energyExtraRate; targetWindAcc = windAcc; }

        // Gain energy based on wind rate
        currentWindRate = Mathf.Lerp(currentWindRate, targetWindRate, targetWindAcc * Time.deltaTime);
        if (currentEnergyAmount == 0.0f && currentWindRate < 0.0f) currentWindRate = 0.0f;
        currentEnergyAmount = Mathf.Max(0.0f, currentEnergyAmount + currentWindRate * Time.deltaTime);
        partTop.transform.localRotation = Quaternion.AngleAxis(currentEnergyAmount, Vector3.up);

        // Use up extra energy if using
        if (extraEnergyInput > 0.0f) extraEnergyInput -= Mathf.Max(0.0f, currentWindRate * Time.deltaTime);

    }


    private void shootLeft() => shootTimerLeft = shootTimerMax;
    private void shootRight() => shootTimerRight = shootTimerMax;


    private void SetTarget(Transform target_) => target = target_;
}
