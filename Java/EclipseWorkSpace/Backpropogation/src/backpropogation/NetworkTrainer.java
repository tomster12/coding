package backpropogation;

public class NetworkTrainer {

	// Config variables
	Network net;
	double learningRate;
	double momentumRate;
	
	// Internal variables
	double[] errorData;
	double[][] currentOutputs;
	double[] currentExpected;
	double[][][] previousChange;
	double[][][] predictionData;
	
	
	// Standard constructor
	public NetworkTrainer(Network net_, double learningRate_, double momentumRate_) {
		net = net_;
		learningRate = learningRate_;
		momentumRate = momentumRate_;
	};

	
	// Train on each set and backpropagate, saving outputs, expected, change and error data
	public void train(double[][][] trainingSet, int trainingAmount, boolean printErrors) {
		System.out.println("\n --Training--");
		errorData = new double[trainingAmount];
		previousChange = net.getBlankWeights();
		for (int i = 0; i < trainingAmount; i++) {
			double totalError = 0;
			for (int o = 0; o < trainingSet.length; o++) {
				currentExpected = trainingSet[o][1];
				currentOutputs = net.propagate(trainingSet[o][0]);
				totalError += getCurrentError();
				previousChange = backPropagate();
			}
			errorData[i] = totalError;
			if (printErrors) System.out.println("Error " + i + ": " + totalError);
		}
		System.out.println(" --Finished training--");
	}
	
	
	// Predict on a set using current net, printing all outputs
	public void predict(double[][][] predictionSet, boolean[] printConfig) {
		System.out.println("\n --Predicting--");
		predictionData = new double[3][predictionSet.length][];
		for (int i = 0; i < predictionSet.length; i++) {
			if (printConfig[0] || printConfig[1] || printConfig[2])
				System.out.println("Case " + i + ":");
			
			double[][] outputs = net.propagate(predictionSet[i][0]);
			double[] output = outputs[net.size.length-1];
			predictionData[0][i] = predictionSet[i][0];
			predictionData[1][i] = predictionSet[i][1];
			predictionData[2][i] = output;
			
			if (printConfig[0]) {
				System.out.println(" -Inputs:");
				for (int o = 0; o < predictionSet[i][0].length; o++) {
					System.out.println("  - " + predictionSet[i][0][o]);
				}
			}
			
			if (printConfig[1]) {
				System.out.println(" -Outputs:");
				for (int o = 0; o < output.length; o++) {					
					if (printConfig[3])
						System.out.println("  - " + (output[o] > 0.5 ? 1 : 0));
					else System.out.println("  - " + output[o]);
				}
			}
			
			if (printConfig[2]) {
				System.out.println(" -Expected Outputs:");
				for (int o = 0; o < predictionSet[i][1].length; o++) {
					if (printConfig[3])
						System.out.println("  - " + (predictionSet[i][1][o] > 0.5 ? 1 : 0));
					else System.out.println("  - " + predictionSet[i][1][o]);
				}
			}
		}
		System.out.println(" --Finished prediction--");
	}
	
	
	// Get the error of the current outputs against current expected
	public double getCurrentError() {
		double[] currentOutput = currentOutputs[net.size.length-1];
		double error = 0;
		for (int i = 0; i < currentExpected.length; i++)
			error += 0.5 * Math.pow(currentExpected[i] - currentOutput[i], 2);
		return error;
	}

	
	// Backpropagate the current net with the current outputs and current expected
	public double[][][] backPropagate() {
		double[][][] currentChange = net.getBlankWeights();
		for (int i = 0; i < net.weights.length; i++) {
			for (int o = 0; o < net.weights[i].length; o++) {
				for (int p = 0; p < net.weights[i][o].length; p++) {
					double partialDerivate = drvErrorWrToWeight(new int[] {i, o, p});
					double change = -learningRate * partialDerivate;
					change += momentumRate * previousChange[i][o][p];
					currentChange[i][o][p] = change;
				}
			}
		}
		for (int i = 0; i < currentChange.length; i++) {
			for (int o = 0; o < currentChange[i].length; o++) {
				for (int p = 0; p < currentChange[i][o].length; p++) {
					net.weights[i][o][p] += currentChange[i][o][p];
				}
			}
		}
		return currentChange;
	}
	
	
	// Derivative of error WRT weight 
	private double drvErrorWrToWeight(int[] weight) {
		double prevNeuronOut = 1;
		if (weight[1] != net.size[weight[0]]) 
			prevNeuronOut = currentOutputs[weight[0]][weight[1]];
		return prevNeuronOut * drvErrorWrToNeuronIn(new int[] {weight[0] + 1, weight[2]});
	}
	
	// Derivative of error WRT neuron input
	private double drvErrorWrToNeuronIn(int[] neuron) {
		double neuronOutput = currentOutputs[neuron[0]][neuron[1]];
		return Network.drvActivatedValue(neuronOutput, neuron[0]) * drvErrorToNeuronOut(neuron);
	}
	
	// Derivative of error WRT neuron output
	private double drvErrorToNeuronOut(int[] neuron) {
		if (neuron[0] == net.size.length-1) {
			return drvErrorWrToOutput(currentExpected[neuron[1]], currentOutputs[neuron[0]][neuron[1]]);
			
		} else {
			double total = 0;
			for (int n = 0; n < net.size[neuron[0] + 1]; n++) {
				double weight = net.weights[neuron[0]][neuron[1]][n];
				double drvErrorToNextNeuronIn = drvErrorWrToNeuronIn(new int[] {neuron[0] + 1, n});
				total += weight * drvErrorToNextNeuronIn;
			}
			return total;
		}
	}
	
	// Derivative of error WRT network output
	private double drvErrorWrToOutput(double expectedOutput, double actualOutput) {
		return actualOutput - expectedOutput;
	}
}
