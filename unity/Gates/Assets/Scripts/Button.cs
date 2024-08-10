using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Button : ParentGateScript {

	public bool Input;


	public override void CalculateOutput () {
		Out = Input;
	}
}
