// ---------------------------------------------------------


#include <stdio.h> // for Print
#include <stdlib.h> // For random
#include <time.h> // For random seed


// ---------------------------------------------------------


int size = 500;
int* randomNums(int);
void sortNums(int**, int);
void bubbleSortNums(int**, int);
void quickSortNums(int**, int, int);
void printNums(int*, int);


// ---------------------------------------------------------


int main() {
  srand(time(0));

  int* nums1 = randomNums(size);
  int* nums2 = randomNums(size);
  bubbleSortNums(&nums1, size);
  quickSortNums(&nums2, 0, size - 1);
  printNums(nums1, size);
  printNums(nums2, size);

  return 0;
}


// ---------------------------------------------------------


int* randomNums(int size) {
  int* nums = malloc(sizeof(int) * size);
  for (int i = 0; i < size; i++) {
    nums[i] = rand() % size;
  }
  return nums;
}


// ---------------------------------------------------------


void bubbleSortNums(int** nums, int size) {
  int sorted = 0;
  while (sorted == 0) {
    sorted = 1;
    for (int i = 0; i < size - 1; i++) {
      if ((*nums)[i] > (*nums)[i + 1]) {
        sorted = 0;
        int tmp = (*nums)[i];
        (*nums)[i] = (*nums)[i + 1];
        (*nums)[i + 1] = tmp;
      }
    }
  }
}


void quickSortNums(int** a, int lo, int hi) {
  if (lo < hi) {
    int pPos = lo - 1;
    int pVal = (*a)[hi];
    for (int cur = lo; cur < hi; cur++) {
      if ((*a)[cur] < pVal) {
        pPos++;
        int tmp = (*a)[cur];
        (*a)[cur] = (*a)[pPos];
        (*a)[pPos] = tmp;
      }
    }
    pPos++;
    int tmp = (*a)[pPos];
    (*a)[pPos] = (*a)[hi];
    (*a)[hi] = tmp;
    int p = pPos;

    if (pPos >= lo) {
      quickSortNums(a, lo, p - 1);
      quickSortNums(a, p + 1, hi);
    }
  }
}


// ---------------------------------------------------------


void printNums(int* nums, int size) {
  for (int i = 0; i < size; i++) {
    printf("%d\n", nums[i]);
  }
  printf("\n");
}


// ---------------------------------------------------------
