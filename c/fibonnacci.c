
#include <stdio.h>
#include <stdlib.h>


int main(int argc, char** argv) {
  printf("You have executed %s with %d input(s)\n", argv[0], argc);
  int x = 0;
  int y = 1;
  int count = 10;
  if (argc > 1) count = atoi(argv[1]);
  for (int i = 0; i < count; i++) {
    y = x + y;
    x = y - x;
    printf("%d\n", x);
  }
  return 0;
}
