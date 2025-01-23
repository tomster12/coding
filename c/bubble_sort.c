#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void bubble_sort(int *a, int size)
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

int main(int argc, char **argv)
{
	srand(time(0));
	int *nums = random_nums(500);
	bubble_sort(nums, 500);
	print_nums(nums, 500);
}
