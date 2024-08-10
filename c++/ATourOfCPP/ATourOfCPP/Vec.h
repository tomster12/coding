
#pragma once

#include <iostream>


template<class T>
class Vec
{
public:
    Vec(size_t);
    Vec(std::initializer_list<T>);
    Vec(const Vec&);
    Vec& operator=(const Vec&);
    ~Vec();
    T& operator[](int) const;
    size_t size() const;

private:
    T* elems;
    size_t sz;
};
