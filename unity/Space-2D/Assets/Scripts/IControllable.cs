using UnityEngine;
using System.Collections;


public interface IControllable {

  void inputMovementDirection(Vector2 direction);

  void inputRotationDirection(float rotation);
}
