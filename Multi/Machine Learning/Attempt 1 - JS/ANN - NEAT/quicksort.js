function quicksort(a, lo, hi) {
  if (lo < hi) {
    let p = partition(a, lo, hi);
    quicksort(a, lo, p - 1);
    quicksort(a, p + 1, hi);
  }
}


function partition(a, lo, hi) {
  let pivot = a[hi].fitness;
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j].fitness < pivot) {
      let tmp = a[j].fitness;
      a[j].fitness = a[i].fitness;
      a[i].fitness = tmp;
      i++;
    }
  }
  let tmp = a[hi].fitness;
  a[hi].fitness = a[i].fitness;
  a[i].fitness = tmp;
  return i;
}
