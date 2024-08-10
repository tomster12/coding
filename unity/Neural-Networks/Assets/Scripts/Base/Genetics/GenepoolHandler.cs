

// This is a public interface for a script which handles a GenePool object
// Primarily used for UI interaction
public interface GenepoolHandler {

  int getGeneration();
  int getAgentCount();
  float getMutationRate();
  float getBestFitness();
  bool getRunning();

  bool getAutoFinish();
  bool getAutoStart();
  bool getInstantRun();
  void setAutoFinish(bool newAutoFinish);
  void setAutoStart(bool newAutoStart);
  void setInstantRun(bool newInstantRun);

  void finishGeneration();
  void startGeneration();
  void stopGeneration();
}