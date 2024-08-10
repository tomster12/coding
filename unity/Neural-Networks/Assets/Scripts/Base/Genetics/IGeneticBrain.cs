
public interface IGeneticBrain<T> {

  T crossover(T other);

  void mutate(float mutationRate);
}