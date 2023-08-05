
import string
import random
import matplotlib.pyplot as plt

def run(pt_alphabet, to_print=False):
    ct_alphabet = []
    while not all([ l in ct_alphabet for l in pt_alphabet ]):
        pick = random.choice(pt_alphabet)
        ct_alphabet += pick
    if to_print:
        print(f"CT {len(ct_alphabet)}: {''.join(ct_alphabet)}")
    return ct_alphabet

pt_alphabet = string.ascii_lowercase
print(f"PT {len(pt_alphabet)}: {''.join(pt_alphabet)}\n")
sizes = [ len(run(pt_alphabet)) for i in range(100) ]

plt.plot(sizes)
plt.show()
