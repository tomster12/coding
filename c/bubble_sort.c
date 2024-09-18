
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int size = 500;
void bubbleSort(int *, int);
int *randomNums(int);
void printNums(int *, int);

int main(int argc, char **argv)
{
  srand(time(0));
  int *nums = randomNums(size);
  bubbleSort(nums, size);
  printNums(nums, size);
  return 0;
}

void bubbleSort(int *a, int size)
{
  int sorted = 0;
  while (sorted == 0)
  {
    sorted = 1;
    for (int i = 0; i < size - 1; i++)
    {
      if (a[i] > a[i + 1])
      {
        sorted = 0;
        int tmp = a[i];
        a[i] = a[i + 1];
        a[i + 1] = tmp;
      }
    }
  }
}

int *randomNums(int size)
{
  int *nums = malloc(sizeof(int) * size);
  for (int i = 0; i < size; i++)
  {
    nums[i] = rand() % size;
  }
  return nums;
}

void printNums(int *nums, int size)
{
  for (int i = 0; i < size; i++)
  {
    printf("%d\n", nums[i]);
  }
}
