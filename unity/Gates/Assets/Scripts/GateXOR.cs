using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GateXOR : ParentGateScript {


	public override void CalculateOutput () {
		Out = false;
		if (Inputs[0]) {
			Out = !Out;
		}
		if (Inputs[1]) {
			Out = !Out;
		}
	}
}
