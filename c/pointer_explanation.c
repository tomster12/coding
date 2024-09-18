
#include <stdio.h>

int main(void)
{
  //  &val  ->  address of val
  // *&val  ->  evaluate the address of val
  int val = 10;

  // int *point ->  evaluation of point is an int
  //      point ->  therefore point is an address
  // int *point = &val ->  if you evaluate point it is an int,
  //                       however point itself = &val => the address of val
  int *point = &val;

  // Printing out the values
  printf("Value of val: %d", val);
  printf("\nValue of val: %d", *point);
  printf("\naddress of val: %p", &val);
  printf("\naddress of val: %p", point);

  // an array is actually a pointer, with a certain amount of
  // space allocated afterwards for variables
  // array[1] = *(array + 1)  ->  where array is a pointer
  int array[] = {
      7,
      1,
      3};
  printf("\nTesting: %d", *array);
}
