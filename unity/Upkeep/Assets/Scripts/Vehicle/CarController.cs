
using UnityEngine;
using System.Collections;
using System.Collections.Generic;


public class CarController : MonoBehaviour
{
    [System.Serializable]
    public class AJInfo
    {
        public HingeJoint joint;
        public HingeJoint axle;
        public bool hasMotor;
        public bool hasSteering;
    }


    // Declare variables
    public List<AJInfo> ajInfos;
    public float steeringMaxAngle;
    public float steeringSpring;
    public float steeringDamper;
    public float motorMaxVelocity;
    public float motorForce;


    public void FixedUpdate()
    {
        // Calculate inputted steering / driving
        float steeringAngle = steeringMaxAngle * Input.GetAxis("Horizontal");
        float motorVelocity = motorMaxVelocity * Input.GetAxis("Vertical");

        // Update steering / motor for required axles / joints
        foreach (AJInfo ajInfo in ajInfos)
        {
            var jointSpring = ajInfo.joint.spring;
            var jointLimits = ajInfo.joint.limits;
            var axleMotor = ajInfo.axle.motor;

            // Apply steering
            ajInfo.joint.useSpring = ajInfo.hasSteering;
            ajInfo.joint.useLimits = true;
            if (ajInfo.hasSteering)
            {
                jointLimits.min = -steeringMaxAngle;
                jointLimits.max = steeringMaxAngle;
                jointSpring.targetPosition = steeringAngle;
                jointSpring.spring = steeringSpring;
                jointSpring.damper = steeringDamper;
            }
            else
            {
                jointLimits.min = 0;
                jointLimits.max = 0;
            }

            // Apply axleMotor
            ajInfo.axle.useMotor = ajInfo.hasMotor;
            ajInfo.axle.useLimits = false;
            if (ajInfo.hasMotor)
            {
                axleMotor.targetVelocity = motorVelocity;
                axleMotor.force = motorForce;
            }

            // Set variables
            ajInfo.joint.spring = jointSpring;
            ajInfo.joint.limits = jointLimits;
            ajInfo.axle.motor = axleMotor;
        }
    }
}
