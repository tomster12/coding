package neat;
import java.util.ArrayList;

import processing.core.PApplet;

public class Main extends PApplet {
	
	// TODO Tweak variables to correctly speciate and allow correct fitness to thrive
	// Specifically speciate coefficents c1 and c2
	
	
	// Global variables
	public static PApplet p;
	public static GeneticAlgorithm genAl;
	private static ArrayList<Button> buttons;
	public static Network testNet;
	
	
	// Main function
	public static void main(String[] args) {
		PApplet.main("neat.Main");	
	}

	
	// PApplet settings
	public void settings() {
		size(600, 600);

		// Setup global variables
		p = this;
		genAl = new GeneticAlgorithm(
			1000,			// Population size
			new int[] {		// Net IO Size
				2, 2		// Input / Output
			},
			new double[] {	// Weight range
				-1, 1
			},
			new double[] { 	// Mutation Chances
				0.2f,			// Raw chance
				0.1f,			// Add neuron
				0.4f,			// Add connection
				0.1f,			// Enable/Disable connection
				0.4f			// Change weight
			}
		);
		buttons = new ArrayList<Button>();
		buttons.add(new Button(20, 20, 	25, 25, 0));	// Create generation
		buttons.add(new Button(20, 60, 	25, 25, 1));	// Start/Stop update
		buttons.add(new Button(20, 100, 25, 25, 2));	// Start/stop finish
		buttons.add(new Button(20, 140, 25, 25, 3));	// Start/stop loop
		buttons.add(new Button(20, 180, 25, 25, 7));	// upf--
		buttons.add(new Button(55, 60, 	25, 25, 4));	// update
		buttons.add(new Button(55, 100, 25, 25, 5));	// finish
		buttons.add(new Button(55, 140, 25, 25, 6));	// loop
		buttons.add(new Button(55, 180, 25, 25, 8));	// upf++
	}
	
	
	// PApplet draw
	public void draw() {
		background(0);
		
		// Main
		genAl.callUpdate();
		for (int i = 0; i < buttons.size(); i++)
			buttons.get(i).callUpdate();
	}
	
	
	// PApplet mouse pressed
	public void mousePressed() {
		for (int i = 0; i < buttons.size(); i++) {
			buttons.get(i).mousePressed();
		}
	}
	
	
	// PApplet key pressed
	public void keyPressed() {
		
		// TODO Remove temp
		if (keyCode == 9) {
			System.out.println(genAl.population.get(0).genData.speciesDifference(genAl.population.get(1).genData));
		
		} else if (keyCode == 81) {
			genAl.population.get(0).genData.mutate();
		} else if (keyCode == 89) {
			genAl.population.get(1).genData.mutate();
		}
	}
}
