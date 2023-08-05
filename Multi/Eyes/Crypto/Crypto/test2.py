
import string
import random
import matplotlib.pyplot as plt
from util import *

random.seed(0)

def generate_alphabet(pt_alphabet):
    ct_map = {}
    ct_alphabet = []
    current_ct = 0
    while not all([ l in ct_map for l in pt_alphabet]):
        letter = random.choice(pt_alphabet)
        ct_map[letter] = (ct_map.get(letter) or []) + [current_ct]
        ct_alphabet += letter
        current_ct += 1
    return ct_map, ct_alphabet

# sizes = []
# for i in range(100):
#     ct_map, ct_alphabet = generate_alphabet(pt_alphabet)
#     sizes += [len(ct_alphabet)]
# plt.plot(sizes)
# plt.show()

# --------------------------------------------------------------------------

pt_msgs_raw = [
    "aThe FitnessGram Pacer TestTestTest is a multistage aerobic capacity test that is a multistage aerobic gets more difficult as it continues",
    "bThe FitnessGram Pacer getsTestmore is a multistage Student exam that progressive is a multistage Student exam first get ready and then start running",
    "cThe FitnessGram Pacer Line up at the start is a multistage childrent exam that teachers do to annoy is a multistage childrent exam why did you forget your pants at home",
    "dThis Fit people test will begin in thirty seconds The running speed starts slowly but gets faster each minute after you hear this signal",
    "eThis Fitness people test will begin in thirty seconds so Line up at the start The running speed starts slowly but dont get fooled cuz it gets faster each minute after you hear this signal",
    "fThis Fit people tests could begin in thirty seconds nineteen dollar fortnite cards The running speed starts slowly who wants them and yes im giving them away",
    "gThis Fitness is the secsonds time you fail a lap before the sound signal Remember to run in a straight line bro The test will begin on the word start On your mark get ready start",
    "hThis Fitn ess is the secsonds or time third time you fail a lap before the so und Remember to run in a straight line today The test will begin on the word start of this mark your test is over",
    "jTh is F it ness is the secsonds time you fail a lap before the sound aerobic Remember to run in a straight line now The test will begin on the word start mark your test is over"
]

pt_msgs = [ msg.lower() for msg in pt_msgs_raw ]
pt_alphabet = set()
for msg in pt_msgs:
    pt_alphabet.update(list(msg))
pt_alphabet = list(pt_alphabet)
ct_map, ct_alphabet = generate_alphabet(pt_alphabet)

print("")
for l in pt_alphabet:
    print(f"{l}: {ct_map[l]}")
print(f"PT {len(ct_alphabet)}: {''.join(ct_alphabet)}\n")

# --------------------------------------------------------------------------

ct_msgs = []
for pt_msg in pt_msgs:
    ct_current = {}
    for l in pt_alphabet:
        ct_current[l] = 0

    ct_msg = []
    print(pt_msg)
    for l in pt_msg:
        ct_msg += [ct_map[l][ct_current[l]]]
        if l == " ":
            for l2 in pt_alphabet:
                ct_current[l2] = (ct_current[l2] + 1) % len(ct_map[l2])
    ct_msgs += [ct_msg]

# --------------------------------------------------------------------------

gaps = get_gaps(ct_msgs, 6, True, False)
plot_im(conv_msgs_to_im(ct_msgs), True)
plot_im(gaps, True)
plt.show()

print_overview(ct_msgs)
