using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GateNOT : ParentGateScript {


	public override void CalculateOutput () {
		Out = !Inputs[0];
	}
}
