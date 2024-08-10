
//using System;
//using UnityEngine;


//[Serializable]
//public struct JabKnifeSettings
//{
//    public float pauseDuration;
//    public float windupDuration;
//    public float windupDistance;
//    public float attackDuration;
//    public float attackDistance;
//}


//public class JabKnife : MonoBehaviour
//{
//    // Declare config, variables
//    [SerializeField] private MeshRenderer mr;

//    private PlayerController pcr;
//    private JabKnifeSettings settings;
//    private Vector3 initialPosition;
//    private Vector3 attackPosition;
//    private float attackTimer;
//    private bool isStarted;
//    private bool isAttacking;


//    public void Initialize(PlayerController pcr_, JabKnifeSettings settings_)
//    {
//        // Initialize variables
//        pcr = pcr_;
//        settings = settings_;
//        initialPosition = transform.position;
//        attackPosition = initialPosition;
//        attackTimer = 0.0f;
//        isStarted = false;
//        isAttacking = false;
//        mr.material.color = new Color(mr.material.color.r, mr.material.color.g, mr.material.color.b, 0.0f);
//    }


//    private void Update()
//    {
//        // Handle pause
//        if (!isStarted)
//        {
//            attackTimer += Time.deltaTime;

//            // Look towards player and alpha in
//            float pausePct = attackTimer / settings.pauseDuration;
//            transform.LookAt(pcr.transform, Vector3.up);
//            SetAlphaPct(pausePct);

//            // Start windup
//            if (attackTimer > settings.pauseDuration)
//            {
//                attackTimer = 0.0f;
//                isStarted = true;
//            }
//            return;
//        }

//        // Handle windup
//        if (!isAttacking)
//        {
//            attackTimer += Time.deltaTime;
//            float windupPct = attackTimer / settings.windupDuration;

//            // Look towards player and move backwards
//            transform.position = initialPosition - transform.forward * settings.windupDistance * Easing.easeInOutCubic(windupPct);

//            // Start attacking
//            if (attackTimer >= settings.windupDuration)
//            {
//                attackTimer = 0.0f;
//                isAttacking = true;
//                attackPosition = transform.position;
//            }
//            return;
//        }

//        // Handle attacking
//        attackTimer += Time.deltaTime;
        
//        // Move forwards and change opacity
//        float attackPct = attackTimer / settings.attackDuration;
//        transform.position = attackPosition + transform.forward * settings.attackDistance * Easing.easeOutCubic(attackPct);
//        SetAlphaPct(1.0f - attackPct);

//        // Finish attacking
//        if (attackTimer >= settings.attackDuration) Destroy(gameObject);
//    }


//    private void SetAlphaPct(float pct)
//    {
//        // Set all material alphas to pct
//        foreach (Material mat in mr.materials)
//        {
//            mat.color = new Color(mat.color.r, mat.color.g, mat.color.b, pct);
//        }
//    }


//    private void OnTriggerEnter(Collider other)
//    {
//        Debug.Log("Detected trigger: " + other.gameObject.name);
//    }
//}

