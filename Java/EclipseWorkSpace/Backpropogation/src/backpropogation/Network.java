package backpropogation;

public class Network {

	// Config variables
	int[] size;
	boolean hasBias;
	double[] weightRange;
	
	// Internal variables
	double[][][] weights;
	
	
	// Standard constructor
	public Network(int[] size_, boolean hasBias_, double[] weightRange_) {
		size = size_;
		hasBias = hasBias_;
		weightRange = weightRange_;
		
		weights = getBlankWeights();
		randomizeWeights();
	}

	
	// Returns a blank array of weights based on current nets size
	public double[][][] getBlankWeights() {
		double[][][] weights = new double[size.length - 1][][];
		for (int i = 0; i < weights.length; i++) {
			int ls = size[i] + (hasBias?1:0);
			int nls = size[i + 1];
			weights[i] = new double[ls][nls];
		}
		return weights;
	}

	
	// Randomizes current nets weights based on weightRange
	private void randomizeWeights() {
		double range = weightRange[1] - weightRange[0];
		double offset = weightRange[0];
		for (int i = 0; i < weights.length; i++) {
			for (int o = 0; o < weights[i].length; o++) {
				for (int p = 0; p < weights[i][o].length; p++) {
					weights[i][o][p] = Math.random() * range + offset;
				}
			}
		}
	}
	
	
	// Prints current nets weights formatted
	public void printWeights() {		
		System.out.println("\n --Printing weights--");
		for (int i = 0; i < weights.length; i++) {
			System.out.println("-Layer: " + i);
			for (int o = 0; o < weights[i].length; o++) {
				System.out.println(" -Neuron: " + o);
				for (int p = 0; p < weights[i][o].length; p++) {
					double cw = weights[i][o][p];
					System.out.println("  -Weight Out: " + p);
					System.out.println("  :" + cw);
				}
			}
		}
	}
	
	
	// Returns the output of propagating the current net
	public double[][] propagate(double[] input) {
		double[][] outputs = new double[size.length][];
		outputs[0] = input;
		for (int i = 0; i < weights.length; i++) {
			double[] currentLayer = outputs[i];
			double[] nextLayer = new double[size[i+1]];
			for (int p = 0; p < size[i+1]; p++) {
				for (int o = 0; o < size[i]; o++)
					nextLayer[p] += currentLayer[o] * weights[i][o][p];
				if (hasBias)
					nextLayer[p] += weights[i][size[i]][p];
				nextLayer[p] = activateValue(nextLayer[p], i);
			}
			outputs[i+1] = nextLayer;
		}
		return outputs;
	}
	
	
	// Activates a value based on nets activation rules
	public static double activateValue(double val, int layer) {
		return 1 / (1 + Math.exp(-val));
	}
	

	// Derives an activated value based on nets activation rules
	public static double drvActivatedValue(double val, int layer) {
		return val * (1 - val);
	}
}
