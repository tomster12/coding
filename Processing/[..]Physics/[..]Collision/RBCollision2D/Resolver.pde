
abstract class Resolver {

  abstract public void resolve(ArrayList<Collision> collisions, float dt);
}


class ImpulseResolver extends Resolver {

  public void resolve(ArrayList<Collision> collisions, float dt) {
    for (Collision collision : collisions) {

      // Get variables of bodies
      RigidBody rbA = collision.bodyA;
      RigidBody rbB = collision.bodyB;
      Float2 normal = collision.info.normal;
      Float2 velA = rbA.velocity;
      Float2 velB = rbB.velocity;
      Float2 relVelAB = velB.sub(velA);                                               // vAB = vB - vA
      float normVel = relVelAB.dot(normal);                                           // = vAB . n
      if (normVel >= 0) continue;
      float invMassA = rbA.isKinematic ? 0.0 : 1.0 / rbA.mass;                        // = 1 / mA
      float invMassB = rbB.isKinematic ? 0.0 : 1.0 / rbB.mass;                        // = 1 / mB
      float e = rbA.restitution * rbB.restitution;

      // Calculate and add impulse
      float j = -(1.0f + e) * normVel / (invMassA + invMassB);                        // j = (-(1 + e) * vAB . n) / (1 / mA + 1 / mB)
      Float2 impulse = collision.info.normal.mult(j);                                 // imp = jn
      if (!rbA.isKinematic) rbA.velocity.isub(impulse.mult(invMassA));                // vA -= imp / mA
      if (!rbB.isKinematic) rbB.velocity.iadd(impulse.mult(invMassB));                // vB += imp / mB

      // Calculate and add friction
      Float2 tangent = relVelAB.sub(collision.info.normal.mult(normVel));             // t = vAB - (vAB . n)n
      if (tangent.mag() > 0.0001) tangent = tangent.normalize();                      // t = |t|
      float tangentVel = relVelAB.dot(tangent);                                       // = vAB . t
      float dynamicMu = new Float2(rbA.dynamicFriction, rbB.dynamicFriction).mag();
      float staticMu = new Float2(rbA.staticFriction, rbB.staticFriction).mag();
      float f = -tangentVel / (invMassA + invMassB);                                  // f = (vAB . t) / (1 / mA + 1 / mB)
      Float2 friction = (abs(f) < (j * dynamicMu))                                    // fr = ...
        ? (tangent.mult(f))                                                           //  = ft                 (if f < (j * dynamicMu))
        : tangent.mult(-j * staticMu);                                                //  = (-j * staticMu)t   (otherwise)
      if (!rbA.isKinematic) rbA.velocity.isub(friction.mult(invMassA));               // rA -= fr / mA
      if (!rbB.isKinematic) rbB.velocity.iadd(friction.mult(invMassB));               // rA += fr / mA

      // TODO: Figure out rotation with friction
      // Float2 point = collision.info.pointA.add(collision.info.pointB).mult(0.5);
      // float vecAPTnorm = point.sub(rbA.transform.position).transpose().dot(normal);   // = rAP_T . n
      // float vecBPTnorm = point.sub(rbB.transform.position).transpose().dot(normal);   // = rBP_T . n
      // float invMomInertiaA = rbA.isKinematic ? 0.0 : 1.0 / rbA.momInertia;            // = 1 / IA
      // float invMomInertiaB = rbB.isKinematic ? 0.0 : 1.0 / rbB.momInertia;            // = 1 / IB

      // j = (-(1 + e) * vAB . n) / ((1 / mA) + (1 / mB) + ((rAP_T . n) ^ 2) / IA + ((rBP_T . n) ^ 2) / IB)
      // float j = (-(1.0f + e) * normVel) / (invMassA + invMassB + vecAPTnorm * vecAPTnorm * invMomInertiaA + vecBPTnorm * vecBPTnorm * invMomInertiaB);

      // float torqueA = vecAPTnorm * j;                                                 // = rAP . jn
      // float torqueB = vecBPTnorm * j;                                                 // = rBP . jn
      // if (!rbA.isKinematic) rbA.rotVelocity += torqueA * invMomInertiaA;              // wA += rAP . jn / IA
      // if (!rbB.isKinematic) rbB.rotVelocity -= torqueB * invMomInertiaB;              // wA += rAP . jn / IA
    }
  }
}


class PositionResolver extends Resolver {

  public void resolve(ArrayList<Collision> collisions, float dt) {
    ArrayList<Float2> bodyADeltas = new ArrayList<Float2>();
    ArrayList<Float2> bodyBDeltas = new ArrayList<Float2>();

    for (Collision collision : collisions) {
      // Get variables of bodies
      float invMassA = 1.0 / collision.bodyA.mass;
      float invMassB = 1.0 / collision.bodyB.mass;
      float percent = 0.8;
      float slop = 0.01;

      // Calculate and add deltas
      Float2 correction = collision.info.normal.mult(
        percent * max(collision.info.length - slop, 0.0f) / (invMassA + invMassB));
      bodyADeltas.add(correction.mult(invMassA));
      bodyBDeltas.add(correction.mult(invMassB));
    }

    // Move all bodies by deltas
    for (int i = 0; i < collisions.size(); i++) {
      if (!collisions.get(i).bodyA.isKinematic) collisions.get(i).bodyA.transform.position.isub(bodyADeltas.get(i));
      if (!collisions.get(i).bodyB.isKinematic) collisions.get(i).bodyB.transform.position.iadd(bodyBDeltas.get(i));
    }
  }
}
