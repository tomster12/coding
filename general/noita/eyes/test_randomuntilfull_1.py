
import string
import random
import matplotlib.pyplot as plt

# Calculate random-until-full alphabet.
#  For a given alphabet generate random letters
#  until entire alphabet is covered.
#  Return the final randomly generated string.
def get_ruf_ct_alphabet(pt_alphabet, to_print=False):
    ct_alphabet = []
    while not all([ l in ct_alphabet for l in pt_alphabet ]):
        pick = random.choice(pt_alphabet)
        ct_alphabet += pick
    if to_print:
        print(f"CT {len(ct_alphabet)}: {''.join(ct_alphabet)}")
    return ct_alphabet

# Calc then plot PT alphabet size for 100 runs
pt_alphabet = string.ascii_lowercase
print(f"PT {len(pt_alphabet)}: {''.join(pt_alphabet)}\n")
sizes = [ len(get_ruf_ct_alphabet(pt_alphabet, True)) for i in range(100) ]
plt.title("CT Alphabet Size For Each Run")
plt.xlabel("Run")
plt.ylabel("Size")
plt.plot(sizes)
plt.show()
