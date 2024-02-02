let y = (f) => ((s) => s(s))((s) => (x) => f(s(s))(x));
//  y = f =>            (s => x => f(s(s))(x)) (s => x => f(s(s))(x))
//  y = f => x =>     f((s => x => f(s(s))(x)) (s => x => f(s(s))(x))) (x)
//  y = f => x =>   f(f((s => x => f(s(s))(x)) (s => x => f(s(s))(x))) (x)) (x)

let add1 = (f) => (x) => (y) => y == 0 ? x : f(x + 1)(y - 1);
let add = y(add1);

let fac1 = (f) => (n) => n < 2 ? 1 : n * f(n - 1);
let fac = y(fac1);

let loop1 = (f) => (n) => (g) => {
    if (n > 0) {
        g(n);
        return f(n - 1)(g);
    }
};
let loop = y(loop1);
let printN = (n) => console.log(n);

let fib1 = (f) => (x) => (y) => {
    console.log(x);
    y = x + y;
    x = y - x;
    if (x < 100) {
        return f(x)(y);
    }
};
let fib = y(fib1);

fib(0)(1);
fac(4);
add(3)(6);
loop(10)(printN);
