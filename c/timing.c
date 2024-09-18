#include <stdio.h>
#include <time.h>

void fib(int amount)
{
  int x = 0;
  int y = 1;
  for (int i = 0; i < amount; i++)
  {
    printf("%d\n", x);
    y = x + y;
    x = y - x;
  }
}

int main()
{
  clock_t start = clock();

  for (int i = 0; i < 20; i++)
  {
    fib(40);
  }

  clock_t diff = clock() - start;
  int msec = diff * 1000 / CLOCKS_PER_SEC;
  printf("Time taken %d milliseconds", msec);

  return 0;
}
