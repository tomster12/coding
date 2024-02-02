package neat;

import java.util.ArrayList;
import processing.core.PConstants;

public class GeneticAlgorithm {
	
	// Config variables
	public int[] netIOSize;				// Public - For networks
	public double[] netWeightRange;		// Public - For networks
	public double[] netMutationChances;	// Public - For networks
	private int populationSize;
	
	
	// Internal variables
	public boolean toUpdate;			// Public - For input
	public boolean toFinish;			// Public - For input
	public boolean toLoop;				// Public - For input
	public int updatesPerFrame;			// Public - For input
	public InnovationManager innoMng; 	// Public - For networks
	private int generationCount;
	private boolean isGenerated;
	private boolean isFinished;
	public Scenario scenario;			// Public - For networks
	public ArrayList<GeneticAgent> population; // TODO Private
	

	// Default constructor
	public GeneticAlgorithm(
			int populationSize_,
			int[] netIOSize_,
			double[] netWeightRange_,
			double[] netMutationChances_) {
		
		populationSize = populationSize_;
		netIOSize = netIOSize_;
		netWeightRange = netWeightRange_;
		netMutationChances = netMutationChances_;
		resetVariables();
	}
	
	
	// Reset all the internal variables
	public void resetVariables() {
		toUpdate = false;
		toFinish = false;
		toLoop = false;
		updatesPerFrame = 1; 
		generationCount = 0;
		isGenerated = false;
		isFinished = false;
		scenario = new Scenario(this);
		innoMng = new InnovationManager(this);
		population = new ArrayList<GeneticAgent>();
	}
	
	
	// Creates a new population
	public void createPopulation() {
		resetVariables();
		for (int i = 0; i < populationSize; i++) {
			population.add(new GeneticAgent(this, i));
		} isGenerated = true;
	}
	
	
	// Called each frame to update entire genetic algorithm
	public void callUpdate() {
		if (isGenerated) {
		
			// Update scenario
		
			// Loop generation - update and finish instantlys
			if (toLoop) {
				loopGeneration();
				
			// Update generation
			} else if (toUpdate && !isFinished) {
				for (int i = 0; i < updatesPerFrame; i++) {
					scenario.callUpdate();
					updateGeneration();
				}
			
			// Finish generation
			} else if (toFinish && isFinished) {
				scenario.callReset();
				finishGeneration();
			}	
			
			// Show generation after all updates
			showGeneration();
			scenario.callShow();
		}
		
		// Variable output
		showVariables();
	}
	
	
	// Call show each agent in population
	private void showGeneration() {
		for (int i = 0; i < populationSize; i++) {
			population.get(i).callShow();
		}
	}
	
	
	// Debug function for showing variables
	private void showVariables() {
		Main.p.noStroke();
		Main.p.fill(255);
		Main.p.textSize(20);
		Main.p.textAlign(PConstants.RIGHT);
		Main.p.text("populationSize: " + population.size()+"/"+populationSize, 	Main.p.width-20, 30);
		Main.p.text("updatesPerFrame: " + updatesPerFrame, 	Main.p.width-20, 60);
		Main.p.text("generationCount: " + generationCount,	Main.p.width-20, 90);
		Main.p.text("isGenerated: " + isGenerated, 			Main.p.width-20, 120);
		Main.p.text("isFinished: " + isFinished, 			Main.p.width-20, 150);
		Main.p.text("toUpdate: " + toUpdate, 				Main.p.width-20, 180);
		Main.p.text("toFinish: " + toFinish, 				Main.p.width-20, 210);
		Main.p.text("toLoop: " + toLoop, 					Main.p.width-20, 240);
	}
	
	
	// Update then finish current generation
	public void loopGeneration() {
		if (isGenerated) {
			while (!isFinished)
				updateGeneration();
			finishGeneration();	
		}
	}
	
	
	// Single update for each agent in population
	public void updateGeneration() {
		if (isGenerated && !isFinished) {
			isFinished = true;
			for (int i = 0; i < populationSize; i++) {
				GeneticAgent curPop = population.get(i);
				curPop.callUpdate();
				if (!curPop.getFinished()) isFinished = false;
			}
		}
	}
	
	
	// Update fitness, cull, breed - iterate generation
	public void finishGeneration() {
		if (isGenerated && isFinished) {
			fitnessGeneration();
			sortGeneration();
			cullGeneration();
			breedGeneration();
			
			generationCount++;
			isFinished = false;
		}
	}
	

	// Update the fitness of all agents and correct for species size - TODO: MIGHT NEED REFACTORING
	private void fitnessGeneration() {
		
		// Get the size of each species and assign each data a species
		ArrayList<GeneticData> speciesRepresenters = new ArrayList<GeneticData>();
		ArrayList<Integer> speciesSize = new ArrayList<Integer>();
		for (int i = 0; i < populationSize; i++) {
			GeneticData curData = population.get(i).genData;
			boolean found = false;
			
			// Check which species it is in
			for (int o = 0; o < speciesRepresenters.size(); o++) {
				GeneticData spData = speciesRepresenters.get(o);
				if (spData.speciesDifference(curData) < 1) {
					speciesSize.set(o, speciesSize.get(o)+1);
					population.get(i).genData.species = o;
					found = true;
					break;
				}
			}
			
			// Make new species if not in any
			if (!found) {
				speciesSize.add(1);
				speciesRepresenters.add(curData);
				curData.species = speciesSize.size()-1;
			}
		}
		
		// Update each genetic agents fitness and correct for their species size
		for (int i = 0; i < populationSize; i++) {
			population.get(i).updateFitness();
			population.get(i).fitness /= speciesSize.get(population.get(i).genData.species);
		}
	}
	
	
	// Sort the generation based on each agents fitness
	private void sortGeneration() {
		
		// Selection sort
		for (int i = 0; i < populationSize; i++) {
			double highest = population.get(i).fitness;
			int highestInd = i;
			for (int o = i+1; o < populationSize; o++) {
				double current = population.get(o).fitness;
				if (current > highest) {
					highest = current;
					highestInd = o;
				}
			}
			GeneticAgent tmp = population.get(i);
			population.set(i, population.get(highestInd));
			population.set(highestInd, tmp);
		}
	}
	
	
	// Remove the bottom half of the population
	private void cullGeneration() {
		int amount = (int)(populationSize/2);
		while (population.size() > amount)
			population.remove(amount);
	}
	

	// Create a new generation by using previous generation based on their fitness
	private void breedGeneration() {
		ArrayList<GeneticAgent> nextGeneration = new ArrayList<GeneticAgent>();
		
		// Get total fitness
		double totFit = 0;
		for (int i = 0; i < (int)(populationSize/2); i++)
			totFit += population.get(i).fitness;
		
		// Get each agents cumulative normalized fitness
		double sum = 0;
		for (int i = 0; i < (int)(populationSize/2); i++) {
			double normFitness = population.get(i).fitness / totFit;
			population.get(i).cumNormFitness = sum;
			sum += normFitness;
		}
				
		// Pick 2 from population based on cumulative normalized fitness
		for (int i = 0; i < populationSize; i++) {
			
			// Get parent 1
			double r1 = Math.random();
			GeneticAgent a1 = population.get(0);
			for (int o = (int)(populationSize/2)-1; o >= 0; o--) {
				if (r1 > population.get(o).cumNormFitness) {
					a1 = population.get(o);
					break;
				}
			}
			
			// Get parent 2
			double r2 = Math.random();
			GeneticAgent a2 = population.get(0);
			for (int o = (int)(populationSize/2)-1; o >= 0; o--) {
				if (r2 > population.get(o).cumNormFitness) { 
					a2 = population.get(o);
					break;
				}
			}
			
			// Crossover the parents and mutate
			GeneticData a3d = a1.genData.crossover(a2.genData);
			a3d.mutate();
			GeneticAgent a3 = new GeneticAgent(this, i);
			a3.genData = a3d;
			
			// Add to next generation
			nextGeneration.add(a3);
		}
		
		// Set current population to next generation
		population = nextGeneration;
	}
}













