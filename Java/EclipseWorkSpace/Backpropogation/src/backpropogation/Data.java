package backpropogation;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

public class Data {
	// Paths for pc / laptop local project files
//	private static String projectPath = "C:\\Users\\tombu\\Documents\\Files\\Coding\\java\\Workspace\\Backpropogation";
	private static String projectPath = "C:\\Users\\tombu\\Files\\Coding\\java\\Work Space\\Backpropogation";
	
	public static double[][][][] setupTrainingData() {
		double[][][][] trainingSets = new double[][][][] {
			new double[0][][],
			new double[0][][],
			new double[0][][],
			new double[0][][],
			new double[0][][]
		};
		
		// 0 - XOR Standard - Training Set
		trainingSets[0] = new double[][][] { 
			{{0, 0}, {0}},
			{{0, 1}, {1}},
			{{1, 0}, {1}},
			{{1, 1}, {0}}
		};
		
		// 1 - XOR Smooth - Prediction Set
		int size = 20;
		trainingSets[1] = new double[size*size][][];
		for (int i = 0; i < size; i++) {
			for (int o = 0; o < size; o++) {
				trainingSets[1][i * size + o] = new double[][] {
					{(double)i / size, (double)o / size},
					{0}
				};
			}
		}
		
		// 2 - Function - Training/Prediction Set
		trainingSets[2] = new double[100][][];
		for (int o = 0; o < trainingSets[2].length; o++) {
			double val = Math.random();
			trainingSets[2][o] = new double[][] {
				new double[] {val},
				new double[] {Math.pow(2*val-1, 3) + Math.pow(2*val-1, 2)}
			};
		}
		
		// 3 - Images - Training/Prediction Set
		trainingSets[3] = new double[50][][];
		for (int i = 0; i < 10; i++) {
			for (int o = 0; o < 5; o++) {
				String fileLocation = projectPath + "\\Numbers\\n"+i+""+o+".png";
				double[] pixels = imageToPixels(fileLocation);
				double[] output = new double[10];
				for (int p = 0; p < 10; p++)
					output[p] = i==p ? 1 : 0;
				trainingSets[3][i*5+o] = new double[][] {
					pixels,
					output
				};
			}
		}
		
		// 4 - Images - Prediction Set
		trainingSets[4] = new double[8][][];
		for (int i = 0; i < 8; i++) {
			String fileLocation = projectPath + "\\Numbers\\np"+i+".png";
			double[] pixels = imageToPixels(fileLocation);
			double[] output = new double[10];
			for (int p = 0; p < 10; p++)
				output[p] = 0;
			trainingSets[4][i] = new double[][] {
				pixels,
				output
			};
		}		

		return trainingSets;
	}
	
	
	// Used with image training set
	private static double[] imageToPixels(String fileLocation) {
		try {
			BufferedImage image = ImageIO.read(new File(fileLocation));
			double[] pixels = new double[image.getWidth() * image.getHeight()];
			for (int x = 0; x < image.getWidth(); x++) {
				for (int y = 0; y < image.getHeight(); y++) {
					pixels[x * image.getWidth() + y] = (image.getRGB(x, y) == 0xFFFFFFFF ? 0 : 1);
				}
			}
			return pixels;
			
		} catch (IOException e) {
			System.out.println("Could not find file: " + fileLocation);
		}
		return null;
	}
}
