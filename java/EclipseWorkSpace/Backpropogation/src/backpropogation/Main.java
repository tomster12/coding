package backpropogation;

import processing.core.PApplet;

public class Main extends PApplet {

	// Global Variables
	private static int scenarioNum = 0;
	private static int scenarioConfig = 1;
	private static double[][][][] trainingSets;
	private static double[] errorData;
	private static double errorDataMax;
	private static double[][][] predictionData;


	// Main function
	public static void main(String[] args) {
		PApplet.main("backpropogation.Main");
		trainingSets = Data.setupTrainingData();
		Network net = null;
		NetworkTrainer netTrainer = null;


		// Setup the scenario (XOR, Function, Image)
		switch (scenarioNum) {

		// Scenario 1 - XOR
			case(0): {
				net = new Network(
					new int[] {2, 2, 1}, 		// Network size
					true, 						// Has bias
					new double[] {-1, 1} 		// Weight range
				);
				netTrainer = new NetworkTrainer(
					net,						// Network
					0.2f,						// Learning rate
					0.95f						// Momentum rate
				);
				netTrainer.train(
					trainingSets[0],			// Training set
					1500,						// Training amount
					false						// print errors
				);
				netTrainer.predict(
					trainingSets[(scenarioConfig==0 ? 0 : 1)], 	// Prediction set
					new boolean[] {
						false, 									// Inputs
						false, 									// Predicted output
						false, 									// Actual output
						false 									// Classified
					}
				);
				break;
			}

			// Scenario 2 - Function
			case (1): {
				net = new Network(
					new int[] {1, 3, 3, 1}, 	// Network size
					true, 						// Has bias
					new double[] {-1, 1} 		// Weight range
				);
				netTrainer = new NetworkTrainer(
					net,						// Network
					0.2f,						// Learning rate
					0.8f						// Momentum rate
				);
				netTrainer.train(
					trainingSets[2],			// Training set
					1500,						// Training amount
					false						// print errors
				);
				netTrainer.predict(
					trainingSets[2],			// Prediction set
					new boolean[] {
						false, 					// Inputs
						true, 					// Predicted output
						true, 					// Actual output
						false 					// Classified
					}
				);
				break;
			}

			// Scenario 3 - Image recognition
			case (2): {
				net = new Network(
					new int[] {64, 8, 8, 10}, 	// Network size
					true, 						// Has bias
					new double[] {-1, 1} 		// Weight range
				);
				netTrainer = new NetworkTrainer(
					net,						// Network
					0.2f,						// Learning rate
					0.8f						// Momentum rate
				);
				netTrainer.train(
					trainingSets[3],			// Training set
					1500,						// Training amount
					false						// print errors
				);
				netTrainer.predict(
					trainingSets[(scenarioConfig==0 ? 3 : 4)], 	// Prediction set
					new boolean[] {
						false, 									// Inputs
						true, 									// Predicted output
						true, 									// Actual output
						false 									// Classified
					}
				);
				break;
			}
		}


		// Update error / prediction data
		if (netTrainer != null) {
			errorData = netTrainer.errorData;
			predictionData = netTrainer.predictionData;
			for (int i = 0; i < errorData.length; i++) {
				if (errorData[i]>errorDataMax)
					errorDataMax = errorData[i];
			}
		}
	}


	// PApplet settings
	public void settings() {
		size(600, 600);
	}


	// PApplet draw
	public void draw() {
		background(0);


		// Show error data
		if (errorData != null) {
			float px = 50;
			float py = 350;
			float sx = width-100;
			float sy = 150;

			stroke(80);
			line(px, py, px+sx, py);
			line(px, py+sy, px+sx, py+sy);

			stroke(255);
			double xMult = sx / errorData.length;
			double yMult = sy / errorDataMax;
			for (int i = 0; i < errorData.length-1; i++) {
				line(
					(float)(px + i * xMult),
					(float)(py + errorData[i] * yMult),
					(float)(px + (i+1) * xMult),
					(float)(py + errorData[i+1] * yMult)
				);
			}
		}


		// Show scenario output (XOR, Function, Image)
		if (predictionData != null) {
			switch (scenarioNum) {

				// Scenario 1 - XOR
				case(0): {
					float px = width/2 - 75;
					float py = 100;
					float sx = 150;
					float sy = 150;
					noStroke();
					int size = floor(sqrt(predictionData[0].length));
					double xMult = sx / size;
					double yMult = sy / size;
					for (int x = 0; x < size; x++) {
						for (int y = 0; y < size; y++) {
							int index = x*size + y;
							fill(255*(float)predictionData[2][index][0]);
							rect(
								(float)(px + x*xMult),
								(float)(py + y*yMult),
								(float)(xMult),
								(float)(yMult)
							);
						}
					}
					break;
				}


				// Scenario 2 - Function
				case (1): {
					float px = 50;
					float py = 100;
					float sx = width-100;
					float sy = 150;
					stroke(80);
					line(px, py, px+sx, py);
					line(px, py+sy, px+sx, py+sy);
					double xMult = sx;
					double yMult = sy;
					for (int i = 0; i < predictionData[0].length-1; i++) {
						stroke(255);
						point(
							(float)(px + predictionData[0][i][0] * xMult),
							(float)(py+sy - predictionData[1][i][0] * yMult)
						);
						stroke(255, 100, 100);
						point(
							(float)(px + predictionData[0][i][0] * xMult),
							(float)(py+sy - predictionData[2][i][0] * yMult)
						);
					}
					break;
				}
			}
		}
	}
}
