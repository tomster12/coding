package neat;

public class GeneticAgent {

	// Config variables
	private GeneticAlgorithm genAl; // NEEDED
	public int index;				// NEEDED
	
	// Internal variables
	public GeneticData genData; 	// NEEDED
	public double fitness;			// NEEDED
	public double cumNormFitness;	// NEEDED
	private Float2 pos;
	private float size;
	private int movementItr;
	private boolean done;
	
	
	// NEEDED - Default constructor
	public GeneticAgent(GeneticAlgorithm genAl_, int index_) {
		genAl = genAl_;
		index = index_;

		genData = new GeneticData(genAl);
		fitness = 0;
		cumNormFitness = 0;
		
		double dist = 0;
		while (dist < 20000) {
			pos = new Float2(
				Math.random()*Main.p.width,
				Math.random()*Main.p.height
			);
			double dx = genAl.scenario.targetPos.x-pos.x;
			double dy = genAl.scenario.targetPos.y-pos.y;
			dist = (dx*dx + dy*dy);
		}

		size = 20;
		movementItr = 0;
		done = false;
	}

	
	// NEEDED - updates the genetic agent
	public void callUpdate() {
		if (!done) {
			double dx = genAl.scenario.targetPos.x-pos.x;
			double dy = genAl.scenario.targetPos.y-pos.y;
			fitness = 1.0f / (dx*dx + dy*dy);
			double[] direction = genData.output(new double[] {dx, dy});
			pos.x += direction[0]*2-1;
			pos.y += direction[1]*2-1;
			
			if (movementItr>300)
				done = true;
			movementItr++;
		}
	}
	

	// NEEDED - Show  the agent
	public void callShow() {
		Main.p.noStroke();
		Main.p.fill(150);
		Main.p.ellipse(pos.x, pos.y, size, size);
	}
	
	
	// NEEDED - get whether it is finished
	public boolean getFinished() {
		return done;
	}
	
	
	// NEEDED updates fitness
	public void updateFitness() {
		
	}
}
