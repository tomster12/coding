#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int *random_nums(int size)
{
	int *nums = malloc(sizeof(int) * size);
	for (int i = 0; i < size; i++)
	{
		nums[i] = rand() % size;
	}
	return nums;
}

void print_nums(int *nums, int size)
{
	for (int i = 0; i < size; i++)
	{
		printf("%d\n", nums[i]);
	}
}

void quick_sort(int *a, int lo, int hi)
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
			quick_sort(a, lo, p - 1);
			quick_sort(a, p + 1, hi);
		}
	}
}

int main(int argc, char **argv)
{
	srand(time(0));
	int *nums = random_nums(500);
	quick_sort(nums, 0, 500 - 1);
	print_nums(nums, 500);
	free(nums);
}
