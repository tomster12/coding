#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void quickSort(int *, int, int);
int *randomNums(int);
void printNums(int *, int);

int size = 500;

int main(int argc, char **argv)
{
  srand(time(0));

  int *nums = randomNums(size);
  quickSort(nums, 0, size - 1);
  printNums(nums, size);
  free(nums);

  return 0;
}

void quickSort(int *a, int lo, int hi)
{
  if (lo < hi)
  {
    int pPos = lo - 1;
    int pVal = a[hi];
    for (int cur = lo; cur < hi; cur++)
    {
      if (a[cur] < pVal)
      {
        pPos++;
        int tmp = a[cur];
        a[cur] = a[pPos];
        a[pPos] = tmp;
      }
    }
    pPos++;
    int tmp = a[pPos];
    a[pPos] = a[hi];
    a[hi] = tmp;
    int p = pPos;

    if (pPos >= lo)
    {
      quickSort(a, lo, p - 1);
      quickSort(a, p + 1, hi);
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
