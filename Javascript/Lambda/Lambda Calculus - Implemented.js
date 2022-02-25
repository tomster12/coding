// ---- Other ----

function print(v) {
  console.log(v);
}


// ---------------

t = a => b => a // True and False
f = a => b => b

not = bl => bl(f)(t) // Simple logical operators
or = x => y => x(x)(y)
and = x => y => x(y)(x)
xor = x => y => x(not(y))(y)

n0 = f => a => a // Number system
n1 = f => a => f(a)
n2 = f => a => f(f(a))
jsnum = n => n(x => x + 1)(0)

b = f => g => a => f(g(a)) // Application of functions
apply = f => a => a(f)

add = n => k => n(next)(k) // Basic mathematical operators
pow = n => k => a => k(n)(a)
mult = n => k => a => n(k(a))
sub = n => k => k(prev)(n)

pair = a => b => f => f(a)(b) // Pair data structure
nil = pair(t)(t)

// (Requires Pairs)
next = n => f => b(f)(n(f)) // Number +1 and -1
phi = p => pair(f(p))(next(f(p)))
prev = n => t(n(phi)(pair(n0)(n0)))


is0 = n => n(t(f))(t) // Comparation of numbers
leq = n => k => is0(sub(n)(k))
eq = n => k => and(leq(n)(k))(leq(k)(n))
g = not(leq)
geq = or(g)(eq)
l = and(leq)(not(eq))

listMake = v => pair(f)(pair(v)(nil)) // List data structure
listAdd = nv => l => pair(f)(pair(nv)(l(f)))
listGet = n => l => (add(n)(n1))(apply(f))(l)(t)

n3 = next(n2) // Extra number initialisation
n4 = next(n3)
n5 = next(n4)
n6 = next(n5)
n7 = next(n6)
n8 = next(n7)
n9 = next(n8)
n10 = next(n9)



// ---- Testing ----

l1 = listMake(n8)
l1 = listAdd(n4)(l1)
l1 = listAdd(n2)(l1)
l1 = listAdd(n1)(l1)
