

class InnoManager {


  int cNInno;
  int cCInno;
  ArrayList<int[]> nInnoList;
  ArrayList<int[]> cInnoList;


  InnoManager(int[] netIoSize) {
    cNInno = netIoSize[0] + netIoSize[1] - 1;
    cCInno = 0;
    nInnoList = new ArrayList<int[]>();
    cInnoList = new ArrayList<int[]>();
  }


  int getNeuronInno(int cInno) {
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


  int getConnectionInno(int nIn, int nOut) {
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
