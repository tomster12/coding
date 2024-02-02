package neat;
import java.util.ArrayList;

public class InnovationManager {
	
	// config variables
	private GeneticAlgorithm genAl;
	
	// Internal variables
	private int cNInno, cCInno;
	private ArrayList<int[]> nInnoList, cInnoList;
	
	
	// Default constructor
	public InnovationManager(GeneticAlgorithm genAl_) {
		genAl = genAl_;
		
		cNInno = genAl.netIOSize[0] + genAl.netIOSize[1] - 1;
		cCInno = 0;
		nInnoList = new ArrayList<int[]>();
		cInnoList = new ArrayList<int[]>();
	}
	
	
	// Custom constructor
	public InnovationManager(int[] IOSize) {
		cNInno = IOSize[0] + IOSize[1] - 1;
		
		cCInno = 0;
		nInnoList = new ArrayList<int[]>();
		cInnoList = new ArrayList<int[]>();
		
	}
	
	
	// Get the innovation num of a neuron, if new update list
	public int getNeuronInno(int cInno) {
		for (int i = 0; i < nInnoList.size(); i++) {
			int[] cNInnoMarking = nInnoList.get(i);
			if (cNInnoMarking[1] == cInno) {
				return cNInnoMarking[0];
			}
		}
		cNInno++;
		nInnoList.add(new int[] {cNInno, cInno});
		return cNInno;
	}
	
	
	// Get the innovation num of a connection, if new update list
	public int getConnectionInno(int nIn, int nOut) {
		for (int i = 0; i < cInnoList.size(); i++) {
	    	int[] cCInnoMarking = cInnoList.get(i);
	    	if (cCInnoMarking[1] == nIn && cCInnoMarking[2] == nOut) {
	    		return cCInnoMarking[0];
	    	}
		}
		cCInno++;
		cInnoList.add(new int[] {cCInno, nIn, nOut});
		return cCInno;
	}
}
