
#include <stdio.h>

int fac(int n)
{
  if (n == 2)
  {
    return n;
  }
  return n * fac(n - 1);
}

int main(void)
{
  for (int i = 0; i < 10; i++)
  {
    printf("%d\n", fac(10));
  }
  return 0;
}
