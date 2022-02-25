package neat;

public class Scenario {

	// Config variables
	private GeneticAlgorithm genAl; // NEEDED
	
	// Internal variables
	private Float2 targetCentre;
	private float targetSize;
	private double targetRadius;
	private double targetProgress;
	public Float2 targetPos;
	
	
	// NEEDED - default constructor
	public Scenario(GeneticAlgorithm genAl_) {
		genAl = genAl_;
		callReset();
	}
	
	
	// NEEDED - resets the scenario
	public void callReset() {
		targetCentre = new Float2(
			Math.random()*(Main.p.width-200)+100,
			Math.random()*(Main.p.height-200)+100
		);
		targetSize = 20;
		targetRadius = 10+Math.random()*20;
		targetProgress = 0;
		targetPos = new Float2(
			targetCentre.x +  Math.cos(targetProgress*Math.PI*2) * targetRadius,
			targetCentre.y + Math.sin(targetProgress*Math.PI*2) * targetRadius
		);
	}
	
	
	// NEEDED - updates the scenario
	public void callUpdate() {
		targetPos = new Float2(
			targetCentre.x + Math.cos(targetProgress*Math.PI*2) * targetRadius,
			targetCentre.y + Math.sin(targetProgress*Math.PI*2) * targetRadius
		);
		targetProgress += 0.01;
	}
	
	
	// NEEDED - shows the scenario
	public void callShow() {
		Main.p.noStroke();
		Main.p.fill(255);
		Main.p.ellipse(targetPos.x, targetPos.y, targetSize, targetSize);
	}
}
