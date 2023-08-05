
import random
from util import *

random.seed(0)

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

# Get PT alphabet
pt_msgs = [ msg.lower() for msg in pt_msgs_raw ]
pt_alphabet = set()
for msg in pt_msgs:
    pt_alphabet.update(list(msg))
pt_alphabet = list(pt_alphabet)

# --------------------------------------------------------------------------

# Construct CT alphabet
current_bucket_end = 0
buckets = {}
for l in pt_alphabet:
    size = random.randrange(2,4)
    bucket = [current_bucket_end, current_bucket_end + size, -1]
    buckets[l] = bucket
    current_bucket_end += size
ct_alphabet = list(range(current_bucket_end))
random.shuffle(ct_alphabet)

def encode(pt_msg, buckets, ct_alphabet):
    current_ct_alphabet = ct_alphabet.copy()
    for l in buckets:
        buckets[l][2] = buckets[l][0]
    ct_msg = []

    for l in pt_msg:
        # Add ciphertext
        ct_msg.append(current_ct_alphabet[buckets[l][2]])

        # Cycle bucket
        buckets[l][2] -= 1
        if buckets[l][2] < buckets[l][0]:
            buckets[l][2] = buckets[l][1] - 1

        # Cycle alphabet
        current_ct_alphabet = current_ct_alphabet[1:] + [current_ct_alphabet[0]]
    
    return ct_msg

# --------------------------------------------------------------------------

# Encode all messages and output summaries
ct_msgs = [ encode(pt_msg, buckets, ct_alphabet) for pt_msg in pt_msgs ]

gaps = get_gaps(ct_msgs, 16, False, True)
plot_im(conv_msgs_to_im(ct_msgs), True)
plot_im(gaps, True)
plt.show()

print_overview(ct_msgs)
