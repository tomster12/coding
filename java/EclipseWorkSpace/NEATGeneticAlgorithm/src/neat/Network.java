package neat;

import java.util.ArrayList;

public class Network {	
	
	// Config variables
	private GeneticAlgorithm genAl;
	
	// Internal variables
	private int[] IOSize;
	private double[] weightRange;
	private InnovationManager innoMng;
	private double[] mutationChances;
	private ArrayList<Integer> neurons;
	private ArrayList<Connection> connections;
	private int[][] neuronOrder; // Updated at setup, mutation and crossover
	private int[] neuronOrderPropLevels; // Updated with neuronOrder
	
	
	// Standard constructor
	public Network(GeneticAlgorithm genAl_) {
		genAl = genAl_;
		
		IOSize = genAl.netIOSize;
		weightRange = genAl.netWeightRange;
		innoMng = genAl.innoMng;
		mutationChances = genAl.netMutationChances;
		neuronOrder = null;
		neurons = new ArrayList<Integer>();
		connections = new ArrayList<Connection>();
		setupNetwork();
		updateNeuronOrder();
	}
	
	
	// Custom contructor
	public Network(int[] IOSize_, double[] weightRange_, InnovationManager innoMng_, double[] mutationChances_) {
		IOSize = IOSize_;
		weightRange = weightRange_;
		innoMng = innoMng_;
		mutationChances = mutationChances_;
		
		neuronOrder = null;
		neurons = new ArrayList<Integer>();
		connections = new ArrayList<Connection>();
		setupNetwork();
		updateNeuronOrder();	
	}
	
	
	// --------------------------------------------- PUBLIC
	
	// Used when creating a new child in crossover
	public void setChild(ArrayList<Integer> uniqueNeurons, ArrayList<int[]> uniqueConnections) {
		neurons = uniqueNeurons;
		connections.clear();
		for (int i = 0; i < uniqueConnections.size(); i++)
			connections.add(new Connection(uniqueConnections.get(i)[0], uniqueConnections.get(i)[1], uniqueConnections.get(i)[2], getRandomWeight()));
		updateNeuronOrder();
	}
	
	// Mutate the network based on input type
	public void mutate() {mutate(0, false);}
	public void mutate(int count, boolean toMutate) {
		double r0 = Math.random();
		double r = Math.random();
		boolean mutated = false;
		
		if (r0 < mutationChances[0] || toMutate) { // Mutated
			double boundary = 0;
			
			// Add neuron
			boundary += mutationChances[1];
			if (r < boundary) {
				int count0 = 0;
				while (count0 < 20) {
					count0++;
					
					// Pick random connection
					if (connections.size()==0)
						break;
					int rCInd = (int)(Math.random()*connections.size());
					if (!connections.get(rCInd).enabled)
						break;
					
					// Split into 2
					int nIn = connections.get(rCInd).nIn;
					int nOut = connections.get(rCInd).nOut;
					int nNInno = innoMng.getNeuronInno(connections.get(rCInd).cInno);
					int nC1Inno = innoMng.getConnectionInno(nIn, nNInno);
					int nC2Inno = innoMng.getConnectionInno(nNInno, nOut);
					connections.get(rCInd).enabled = false;
					connections.add(new Connection(nC1Inno, nIn, nNInno, getRandomWeight()));
					connections.add(new Connection(nC2Inno, nNInno, nOut, getRandomWeight()));
					neurons.add(nNInno);
					mutated = true;
//					System.out.println("Add neuron " + nNInno + " on " + connections.get(rCInd).cInno + " make " + nC1Inno + " and " + nC2Inno);
					break;
				}
			
			} else {
				// Add connection
				boundary += mutationChances[2];
				if (r < boundary) {
					int rN1Ind = (int)(Math.random()*neurons.size());
					int rN1Inno = neurons.get(rN1Ind);
					int rN1PropLevel = neuronOrderPropLevels[rN1Inno];
					if (rN1PropLevel+1 < neuronOrder.length) {
						
						// Get list of possible neurons
						ArrayList<Integer> possibleNeurons = new ArrayList<Integer>();
						for (int i = rN1PropLevel+1; i < neuronOrder.length; i++) {
							for (int o = 0; o < neuronOrder[i].length; o++) {
								possibleNeurons.add(neuronOrder[i][o]);
							}
						}
						int rN2Ind = (int)(Math.random()*possibleNeurons.size());
						int rN2Inno = possibleNeurons.get(rN2Ind);
						boolean possible = true;
						
						// Check if exists
						for (int i = 0; i < connections.size(); i++) {
							possible = possible && 
							!(connections.get(i).nIn == rN1Inno
							&& connections.get(i).nOut == rN2Inno);
						}
						
						// Create connection
						if (possible) {
							int nCInno = innoMng.getConnectionInno(rN1Inno, rN2Inno);
							connections.add(new Connection(nCInno, rN1Inno, rN2Inno, getRandomWeight()));
							mutated = true;
//							System.out.println("create connection " + rN1Inno + "->" + rN2Inno + " :" + nCInno);
						}
					}
				
				} else {
					// Enable/Disable connection
					boundary += mutationChances[3];
					if (r < boundary) {
						if (connections.size() > 0) {
							int rCInd = (int)(Math.random()*connections.size());
							connections.get(rCInd).enabled = !connections.get(rCInd).enabled;
							mutated = true;
//							System.out.println("enable/disable connection " + connections.get(rCInd).cInno);
						}
						
					} else {
						// Change weight
						boundary += mutationChances[4];
						if (r < boundary) {
							if (connections.size() > 0) {
								int rCInd = (int)(Math.random()*connections.size());
								connections.get(rCInd).weight = getRandomWeight();
								mutated = true;
//								System.out.println("Change weight " + connections.get(rCInd).cInno);
							}
						
						} else {
							System.out.println("Mutation chance error");
						}
					}
				}
			}
			
			if (!mutated) { // Mutation - Failed
				if (count>50) {
					System.out.println("Mutation - Failed - reached limit");
				} else {
					mutate(count+1, true);
				}
			
			} else { // Mutation - success
				updateNeuronOrder();
			}

		} else { // No Mutation
		}
	}
	
	
	// Propagate a set of inputs through the network
	public double[] propagate(double[] input) {
		if (input.length != IOSize[0]) {
			System.out.println("Incorrect input size");
			return null;
		}

		// Get max neuron inno and create list with size
		int mNInno = getMaxNInno();
		double[] values = new double[mNInno+1];
		double[] output = new double[IOSize[1]];
		
		// Loop through neuronOrder for correct order
		for (int i = 0; i < neuronOrder.length; i++) {
			for (int o = 0; o < neuronOrder[i].length; o++) {
				int nInno = neuronOrder[i][o];
				
				if (nInno < IOSize[0]) { //  Input - set to input
					values[nInno] = input[nInno];
				
				} else { // Not input then activate
					values[nInno] = activateValue(values[nInno], 0);

				} if (nInno >= IOSize[0] && nInno < IOSize[0]+IOSize[1]) { // Output - set output
					output[nInno-IOSize[0]] = values[nInno];
				
				} else { // Input or hidden - propagate connection
					for (int p = 0; p < connections.size(); p++) {
						if (connections.get(p).nIn == nInno && connections.get(p).enabled) {
							values[connections.get(p).nOut] += connections.get(p).weight * values[nInno];
						}
					}
				}
			}
		}
		
		return output;
	}
	
	
	// Crossover the current network with the other
	public Network crossover(Network other) {
		ArrayList<Integer> uniqueNeurons = new ArrayList<Integer>();
		ArrayList<int[]> uniqueConnections = new ArrayList<int[]>();
		
		// Get neurons from current network
		for (int i = 0; i < neurons.size(); i++)
			if (!uniqueNeurons.contains(neurons.get(i)))
				uniqueNeurons.add(neurons.get(i));
		
		// Get neurons from other network
		for (int i = 0; i < other.neurons.size(); i++)
			if (!uniqueNeurons.contains(other.neurons.get(i)))
				uniqueNeurons.add(other.neurons.get(i));
		
		// Get connections from current network
		for (int i = 0; i < connections.size(); i++) {
			boolean contains = false;
			for (int o = 0; o < uniqueConnections.size(); o++)
				if (uniqueConnections.get(o)[0] == connections.get(i).cInno)
					contains = true;
			if (!contains)
				uniqueConnections.add(new int[] {
					connections.get(i).cInno,
					connections.get(i).nIn,
					connections.get(i).nOut
				});
		}
		
		// Get connections from other network
		for (int i = 0; i < other.connections.size(); i++) {
			boolean contains = false;
			for (int o = 0; o < uniqueConnections.size(); o++)
				if (uniqueConnections.get(o)[0] == other.connections.get(i).cInno)
					contains = true;
			if (!contains)
				uniqueConnections.add(new int[] {
						other.connections.get(i).cInno,
						other.connections.get(i).nIn,
						other.connections.get(i).nOut
				});
		}
		
		// Create new network
		Network newNet;
		if (genAl == null) newNet = new Network(IOSize, weightRange, innoMng, mutationChances);
		else newNet = new Network(genAl);
		newNet.setChild(uniqueNeurons, uniqueConnections);
		return newNet;
	}
	
	
	// Speciate difference betwen this net and other - TODO MIGHT NEED REFACTORING
	public double netDifference(Network other) {
		int totExc = 0;
		double aveWeightDif = 0, aveWeightCount = 0;
		double c1 = 0.4, c2 = 0.02;
		
		// Get total excess neurons
		for (int i = 0; i < neurons.size(); i++)
			if (!(other.neurons.contains(neurons.get(i))))
				totExc++;
		
		for (int i = 0; i < other.neurons.size(); i++)
			if (!(neurons.contains(other.neurons.get(i))))
				totExc++;
		
		// Get total excess connections
		for (int i = 0; i < connections.size(); i++) {
			boolean contains = false;
			for (int o = 0; o < other.connections.size(); o++)
				if (other.connections.get(o).cInno == connections.get(i).cInno)
					contains = true;
			if (!contains)
				totExc++;
		}
			
		for (int i = 0; i < other.connections.size(); i++) {
			boolean contains = false;
			for (int o = 0; o < connections.size(); o++)
				if (connections.get(o).cInno == other.connections.get(i).cInno)
					contains = true;
			if (!contains)
				totExc++;
		}
			
		// Get ave weight difference
 		for (int i = 0; i < connections.size(); i++) {
 			for (int o = 0; o < other.connections.size(); o++)
 				if (connections.get(i).cInno == other.connections.get(o).cInno) {
 					aveWeightDif += Math.abs(connections.get(i).weight-other.connections.get(o).weight);
 					aveWeightCount++;
 					break;
 				}
 		}
 		
		return c1*totExc + c2*(aveWeightCount==0?0:(aveWeightDif/aveWeightCount));
	}


	// --------------------------------------------- PRIVATE
	
	// Setup the default network using the provided IOSize
	private void setupNetwork() {
		for (int i = 0, nInno = 0; i < IOSize.length; i++) {
			for (int o = 0; o < IOSize[i]; o++, nInno++)
				neurons.add(nInno);
		}
	}
	
	
	// Orders the neurons based on connections and type
	private void updateNeuronOrder() {
		neuronOrderPropLevels = new int[getMaxNInno()+1];
		for (int i = 0; i < neuronOrderPropLevels.length; i++)
			neuronOrderPropLevels[i] = i>=IOSize[0] && i<IOSize[0]+IOSize[1] ? 1 : 0;
		
		// For each input neuron set propLevel of each connected
		for (int i = 0; i < IOSize[0]; i++) {
			updateNeuronOrderChild(i, 1);
		}
		
		// Get max prop levels and seperate into categories
		int maxPropLevel = 0;
		for (int i = 0; i < neuronOrderPropLevels.length; i++)
			maxPropLevel = Math.max(neuronOrderPropLevels[i], maxPropLevel);
		
		// Set output to max prop level
		for (int i = IOSize[0]; i < IOSize[0]+IOSize[1]; i++)
			neuronOrderPropLevels[i] = maxPropLevel;
			
		// Setup neuronOrder using the propLevels
		neuronOrder = new int[maxPropLevel+1][];
		for (int i = 0; i <= maxPropLevel; i++) {
			ArrayList<Integer> currentPropLevel = new ArrayList<Integer>();
			for (int o = 0; o < neuronOrderPropLevels.length; o++) {
				if (neuronOrderPropLevels[o]==i && neurons.contains(o))
					currentPropLevel.add(o);
			}
			neuronOrder[i] = new int[currentPropLevel.size()];
			for (int o = 0; o < currentPropLevel.size(); o++)
				neuronOrder[i][o] = currentPropLevel.get(o);
		}
	}
	
	
	// Helper function for updateNeuronOrder recursion
	private void updateNeuronOrderChild(int nInno, int level) {
		for (int i = 0; i < connections.size(); i++) {
			int nIn = connections.get(i).nIn;
			int nOut = connections.get(i).nOut;
			if (nIn == nInno) {
				int newPropLevel = Math.max(neuronOrderPropLevels[nOut], level);
				neuronOrderPropLevels[nOut] = newPropLevel;
				updateNeuronOrderChild(nOut, newPropLevel+1);
			}
		}
	}
	
	
	// Get the maximum nInno out of all neurons
	private int getMaxNInno() {
		int maxNInno = 0;
		for (int i = 0; i < neurons.size(); i++)
			maxNInno = Math.max(maxNInno, neurons.get(i));
		return maxNInno;
	}
	
	
	// Get a random weight based on weight range
	private double getRandomWeight() {
		return weightRange[0] + Math.random()*(weightRange[1]-weightRange[0]);
	}
	
	
	// Activates a value based on nets activation rules
	private static double activateValue(double val, int type) {
		if (type==0)
			return 1 / (1 + Math.exp(-val));
		return 0;
	}
	
	
	// Connection class
	public class Connection { // TODO Private
		
		int cInno;
		int nIn, nOut;
		double weight;
		boolean enabled;
		
		
		public Connection(int cInno_, int nIn_, int nOut_, double weight_) {
			cInno = cInno_;
			nIn = nIn_;
			nOut = nOut_;
			weight = weight_;
			enabled = true;
		}
	}
}
