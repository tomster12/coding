using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GateOR : ParentGateScript {


	public override void CalculateOutput () {
		Out = Inputs[0] || Inputs[1];
	}
}
