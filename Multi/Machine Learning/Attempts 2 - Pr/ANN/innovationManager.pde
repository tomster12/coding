class innovationManager {
    
  int nxInno;
  ArrayList<innovation> innovations;
  
  
  innovationManager() {
    nxInno = 0;
    innovations = new ArrayList<innovation>();
  }
  
  
  innovation getInno(int nInInno_, int nOutInno_) {
    for (int i = 0; i < innovations.size(); i++) {
      if (innovations.get(i).nInInno == nInInno_) {
        if (innovations.get(i).nOutInno == nOutInno_) {
          return innovations.get(i);
        }
      }
    }
    innovation nInno = new innovation(nxInno, nInInno_, nOutInno_);
    innovations.add(nInno);
    nxInno++;
    return nInno;
  }
}




class innovation {
  
  
  int inno;
  int nInInno;
  int nOutInno;
  
  
  innovation(int inno_, int nInInno_, int nOutInno_) {
    inno = inno_;
    nInInno = nInInno_;
    nOutInno = nOutInno_;
  }
}
