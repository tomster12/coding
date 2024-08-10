
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class ComboHandler : MonoBehaviour
{

    // Declare references, variables
    private enum AttackState { READY, BUSY, COMBO_BUFFER, COMBO, RECOVERING }

    private Animator animator;

    private string currentAttack = "";
    private bool[] hitboxActive = new bool[1];
    private AttackState attackState = AttackState.READY;
    private bool toCombo = false;


    public void Awake()
    {
        // Initialize references
        animator = GetComponent<Animator>();
    }


    public void Update()
    {
        // Perform buffered combo attack
        if (toCombo && attackState == AttackState.COMBO)
        {
            Debug.Log("Buffer comboing");
            TriggerComboAttack();
        }
    }


    public void Attack()
    {
        // Handle basic / combo attacks
        if (attackState == AttackState.READY)
        {
            Debug.Log("Attacking");
            TriggerAttack();
        }
        else if (attackState == AttackState.COMBO_BUFFER)
        {
            Debug.Log("Buffering");
            toCombo = true;
        }
        else if (attackState == AttackState.COMBO)
        {
            Debug.Log("Comboing");
            TriggerComboAttack();
        }
    }


    public void TriggerAttack()
    {
        // Perform basic attack
        currentAttack = "";
        hitboxActive = new bool[1];
        attackState = AttackState.BUSY;
        toCombo = false;
        animator.SetTrigger("Attack");
    }
    public void TriggerComboAttack()
    {
        // Perform combo attack
        currentAttack = "";
        hitboxActive = new bool[1];
        attackState = AttackState.BUSY;
        toCombo = false;
        animator.SetTrigger("Combo Attack");
    }


    public void OnAttackStart(string name)
    {
        Debug.Log("Starting attack: " + name);
        currentAttack = name;
        attackState = AttackState.BUSY;
    }
    public void OnAttackFinish(string name)
    {
        if (name != currentAttack) return;
        currentAttack = "";
        hitboxActive = new bool[1];
        attackState = AttackState.READY;
        toCombo = false;
        animator.SetTrigger("Attack Finish");
    }


    public void OnAttackActive(int hitboxID)
    {
        hitboxActive[hitboxID] = true;
    }
    public void OnAttackInactive(int hitboxID)
    {
        hitboxActive[hitboxID] = false;
    }


    public void OnAttackCanBufferCombo(string name)
    {
        if (name != currentAttack) return;
        attackState = AttackState.COMBO_BUFFER;
    }
    public void OnAttackCanCombo(string name)
    {
        if (name != currentAttack) return;
        attackState = AttackState.COMBO;
    }
    public void OnAttackCannotCombo(string name)
    {
        if (name != currentAttack) return;
        attackState = AttackState.RECOVERING;
    }
}
