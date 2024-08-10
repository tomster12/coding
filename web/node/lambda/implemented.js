// https://www.youtube.com/watch?v=pAnLQ9jwN-E&t=11s

// ---------------------------------
// -- Explanation
//
// TRUE = (λx.λy.x)
// FALSE = (λx.λy.y)
// NOT = (λb.b FALSE TRUE)
//
// Whatever you pass into (NOT) will have (FALSE TRUE) applied to it
//
// NOT TRUE = (λb.b FALSE TRUE) TRUE
//          = (λb.b FALSE TRUE) (λx.λy.x)
//          = (λx.λy.x) (FALSE TRUE)
//          = FALSE
//
// ---------------------------------
//
// TRUE  = λx.λy.x
// FALSE = λx.λy.y
// NOT   = λb.b FALSE TRUE
// OR    = λx.λy.x x y
// AND   = λx.λy.x y x
// XOR   = λx.λy.x (NOT y) y
//
// ---------------------------------

// -- True and False
// t = λa.λb.a
// f = λa.λb.b
t = (a) => (b) => a;
f = (a) => (b) => b;

// -- Simple logical operators
// not = λB.B f t
// or = λx.λy.x x
// and = λx.λy.x y x
// xor = λx.λy.x (not y) y
not = (bl) => bl(f)(t);
or = (x) => (y) => x(x)(y);
and = (x) => (y) => x(y)(x);
xor = (x) => (y) => x(not(y))(y);

// -- Application of functions
// b = λf.λg.λa.f (ga)
// apply = λf.λa.a f
b = (f) => (g) => (a) => f(g(a));
apply = (f) => (a) => a(f);

// -- Pair data structure
// pair = λa.λb.λf.f a b
// nil = pair t t
// fst = λp.p t
// snd = λp.p f
pair = (a) => (b) => (f) => f(a)(b);
nil = pair(t)(t);
fst = (p) => p(t);
snd = (p) => p(f);

// -- Number system
// n0 = λf.λa.a
// n1 = λf.λa.f a
// n2 = λf.λa.f (fa)
// convertnum = λn.n (x => x + 1) 0
n0 = (f) => (a) => a;
n1 = (f) => (a) => f(a);
n2 = (f) => (a) => f(f(a));
convertnum = (n) => n((x) => x + 1)(0);

// -- Basic operators
// succ = λn.λf.b f (nf)
// phi = λp.pair(pf)(succ(pf))
// pred = λn.(n (phi) (pair n0 n0))
succ = (n) => (f) => b(f)(n(f));
phi = (p) => pair(snd(p))(succ(snd(p)));
pred = (n) => fst(n(phi)(pair(n0)(n0)));

// -- Derived operators
// add = λn.λk.n(succ)(k)
// pow = λn.λk.λa.kna
// mult = λn.λk.λa.n(ka)
// sub = λn.λk.k pred n
add = (n) => (k) => n(succ)(k);
pow = (n) => (k) => (a) => k(n)(a);
mult = (n) => (k) => (a) => n(k(a));
sub = (n) => (k) => k(pred)(n);

// is0 = λn.n (tf) t
is0 = (n) => n(t(f))(t);
leq = (n) => (k) => is0(sub(n)(k));
eq = (n) => (k) => and(leq(n)(k))(leq(k)(n));
g = not(leq);
geq = or(g)(eq);
l = and(leq)(not(eq));

// -- List data structure
// listMake = λv.pair (f) (pairvnil)
// listAdd = λv.vl.pair (f) (pair(v) (lf))
// listGet = λn.λl.(add (n) (n1)) (applyf) (l) t
listMake = (v) => pair(f)(pair(v)(nil));
listAdd = (nv) => (l) => pair(f)(pair(nv)(l(f)));
listGet = (n) => (l) => add(n)(n1)(apply(f))(l)(t);

// ---------------------------------
// -- Testing

n3 = succ(n2);
n4 = succ(n3);
n5 = succ(n4);
n6 = succ(n5);
n7 = succ(n6);
n8 = succ(n7);
n9 = succ(n8);
n10 = succ(n9);

l1 = listMake(n8);
l1 = listAdd(n4)(l1);
l1 = listAdd(n2)(l1);
l1 = listAdd(n1)(l1);
