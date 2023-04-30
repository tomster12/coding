
#include "Vec.h"
#include <iostream>


int main()
{
    Vec<float> a = { 1.0f, 2.0f, 3.0f, 4.0f, 5.0f };

    Vec<float> b = { a };
    Vec<float> c = a;
    Vec<float>& d = a;

    a[2] = 4;
    c[2] = 7;

    std::cout << "a[2]:" << a[2] << std::endl;
    std::cout << "b[2]:" << b[2] << std::endl;
    std::cout << "c[2]:" << c[2] << std::endl;
    std::cout << "d[2]:" << d[2] << std::endl;
}
