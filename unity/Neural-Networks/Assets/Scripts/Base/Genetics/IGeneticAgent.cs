
public interface IGeneticAgent<T> where T : IGeneticBrain<T> {

  void destroyAgent();

  void startAgent();

  void stopAgent();

  void updateAgent();

  bool getFinished();

  float getFitness();

  void setBrain(T brain);

  T getBrain();
}