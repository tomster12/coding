package neat;

public class GeneticData {

	// Config variables
	private GeneticAlgorithm genAl; // NEEDED
	
	// Internal variables
	public int species;				// NEEDED
	private Network net;
	
	
	// NEEDED - Default constructor
	public GeneticData(GeneticAlgorithm genAl_) {
		genAl = genAl_;
		
		species = -1;
		net = new Network(genAl);
	}
	
	
	// NEEDED - get the species-difference between this and otherData
	public double speciesDifference(GeneticData otherData) {
		return net.netDifference(otherData.net);
	}
	
	
	// NEEDED - cross over the current data with the provided data
	public GeneticData crossover(GeneticData otherAgent) {
		Network newNet = net.crossover(otherAgent.net);
		GeneticData newAgent = new GeneticData(genAl);
		newAgent.net = newNet;
		return newAgent;
	}
	
	
	// NEEDED - used by agent to get output based on inputs
	public double[] output(double[] input) {
		return net.propagate(input);
	}
	
	
	// NEEDED - mutate current data based on mutationChances
	public void mutate() {
		net.mutate();
	}
}
