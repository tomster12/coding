
import random
import matplotlib.pyplot as plt
import locallib.crypto

random.seed(0)

pt_msgs_raw = [
    "aThe FitnessGram Pacer TestTestTest is a multistage aerobic capacity test that is a multistage aerobic gets more difficult as it continues",
    "bThe FitnessGram Pacer getsTestmore is a multistage Student exam that progressive is a multistage Student exam first get ready and then start running",
    "cThe FitnessGram Pacer Line up at the start is a multistage qchildrent exam that teachers do to annoy is a multistage childrent exam why did you forget your pants at home",
    "dThis Fit people test will begin in thirty seconds The running speed starts slowly but gets faster each minute after you hear this signal",
    "eThis Fitness people test will begin in thirty seconds so Line up at the start The running speed starts slowly but dont get fooled cuz it gets faster each minute after you hear this signal",
    "fThis Fit people tests could begin in thirty seconds nineteen dollar fortnite cards The running speed starts slowly who wants them and yes im giving them away",
    "gThis Fitness is the secsonds time you fail a lap before the sound signal Remember to run in a straight line bro The test will begin on the word start On your mark get ready start",
    "hThis Fitn ess is the secsonds or time third time you fail a lap before the so und Remember to run in a straight line today The test will begin on the word start of this mark your test is over",
    "jTh is F it ness is the secsonds time you fail a lap before the sound aerobic Remember to run in a straight line now The test will begin on the word start mark your test is over"
]

# Get PT alphabet
pt_msgs = [ msg.lower().replace(" ", "") for msg in pt_msgs_raw ]
pt_alphabet = set()
for msg in pt_msgs:
    pt_alphabet.update(list(msg))
pt_alphabet = list(pt_alphabet)

def encode(pt_alphabet, pt_msg, key):
    outer_ring = list(range(len(pt_alphabet)))
    inner_ring = [ pt_alphabet.index(l) for l in key ]
    pt_msg = [ pt_alphabet.index(l) for l in pt_msg ]

    def rotate(ring, dir):
       return ring[-dir:] + ring[:-dir]

    ct_msg = []
    for l in pt_msg:
        outer_index = outer_ring.index(l)
        inner = inner_ring[outer_index]
        inner_index = outer_ring.index(inner)
        ct_msg.append(outer_index + inner_index)

        # outer_ring = rotate(outer_ring, 1)
        inner_ring = rotate(inner_ring, 1)

    return ct_msg

# Encode all messages and output summaries
# print(pt_alphabet)
key = "thisisakeyusedfortiscipher"
ct_msgs = [ encode(pt_alphabet, pt_msg, key) for pt_msg in pt_msgs ]

# Plot CT messages and gaps
locallib.crypto.plot_msgs(ct_msgs, True, title="CT Messages")
gaps = locallib.crypto.calc_gaps(ct_msgs, 16, False, False)
locallib.crypto.plot_im(gaps, True, title="CT Repeats, Gap Size < 16")
plt.show()

print(f"{len(pt_alphabet)}: {pt_alphabet}")
locallib.crypto.full_overview(ct_msgs)
