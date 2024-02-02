
#include "Vec.h"
#include <iostream>


template<class T>
Vec<T>::Vec(size_t sz_)
{
    if (sz < 0) throw std::length_error{ "Vec::Vec : Invalid size."};
    elems = new T[sz_];
    sz = sz_;
}

template<class T>
Vec<T>::Vec(std::initializer_list<T> elems_)
{
    elems = new T[elems_.size()];
    sz = elems_.size();
    std::copy(elems_.begin(), elems_.end(), elems);
}

template<class T>
Vec<T>::Vec(const Vec& a)
{
    elems = new T[a.sz];
    sz = a.sz;
    for (int i = 0; i < sz; ++i) elems[i] = a.elems[i];
}

template<class T>
Vec<T>& Vec<T>::operator=(const Vec& a)
{
    T* newElems = new T[a.sz];
    for (int i = 0; i < a.sz; ++i) newElems[i] = a.elems[i];
    delete[] elems;
    elems = newElems;
    sz = a.sz;
    return *this;
}

template<class T>
Vec<T>::~Vec()
{
    delete[] elems;
}

template<class T>
T& Vec<T>::operator[](int i) const
{
    if (i < 0 || i >= sz) throw std::out_of_range{ "Vec::[] : i out of range." };
    return elems[i];
}

template<class T>
size_t Vec<T>::size() const
{
    return sz;
}


template class Vec<float>;
