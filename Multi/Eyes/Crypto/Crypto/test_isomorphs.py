
import string
import locallib.crypto

def encode_caeser(pt, pt_alphabet, shift=3):
    ct = ""
    for l in pt:
        index = pt_alphabet.index(l)
        ct += pt_alphabet[(index + shift) % len(pt_alphabet)]
    return ct

def encode_caeser_progressive(pt, pt_alphabet, shift=3):
    ct = ""
    for l in pt:

        if l == " ":
            shift += 1
            ct += " "

        else:
            index = pt_alphabet.index(l)
            ct += pt_alphabet[(index + shift) % len(pt_alphabet)]

    return ct

def wrap_mod(v, m):
    return (v + m) % m

def text_diff(alphabet, t0, t1):
    diff = []
    for i in range(min(len(t0), len(t1))):
        i0 = alphabet.index(t0[i])
        i1 = alphabet.index(t1[i])
        iDiff = wrap_mod(i0 - i1, len(alphabet))
        diff += "." if (iDiff == 0) else alphabet[iDiff - 1]
    return "".join(diff)

def s0():
    print("\nPlaintext <-> Ciphertext Isomorph (Caeser Cipher)")
    print("----------------------------------------------------------------------------------\n")

    pt = "TESTINGISOMORPHS"
    pt_alphabet = string.ascii_uppercase
    cts = [ [i, encode_caeser(pt, pt_alphabet, i)] for i in range(-1, 2) ]

    for ct in cts:
        print(f"Shift: {ct[0]}")
        print("  " + pt)
        print("- " + ct[1])
        print("= " + text_diff(pt_alphabet, pt, ct[1]))
        print()
    
    print(locallib.crypto.calc_if_isomorphic(pt, cts[0][1]))

    print("\n----------------------------------------------------------------------------------\n")
s0()

def s1():
    print("\nCiphertext <-> Ciphertext Isomorph (Caeser Progressive Cipher)")
    print("----------------------------------------------------------------------------------\n")

    pt = "EVERY SUBSTITUTION CIPHER NEEDS A SUBSTITUTION KEY"
    pt_alphabet = string.ascii_uppercase
    ct = encode_caeser_progressive(pt, pt_alphabet, 1)

    print(pt)
    print(ct)
    print()

    isos = locallib.crypto.calc_isomorphs(ct, ct)
    for iso in isos:
        print(iso)

    print("\n----------------------------------------------------------------------------------\n")
s1()
