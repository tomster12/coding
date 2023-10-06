
import random
import matplotlib.pyplot as plt
import locallib.crypto

random.seed(0)

# Calculate random-until-full alphabet.
#  For a given alphabet generate random letters
#  until entire alphabet is covered.
#  Return a map from plaintext to a list of the
#  indices that letter was generated on.
def generate_ruf_ct_alphabet(pt_alphabet):
    ct_map = {}
    ct_alphabet = []
    current_ct = 0
    while not all([ l in ct_map for l in pt_alphabet]):
        letter = random.choice(pt_alphabet)
        ct_map[letter] = (ct_map.get(letter) or []) + [current_ct]
        ct_alphabet += letter
        current_ct += 1
    return ct_map, ct_alphabet

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

# Parse plaintext alphabet
pt_msgs = [ msg.lower() for msg in pt_msgs_raw ]
pt_alphabet = set()
for msg in pt_msgs:
    pt_alphabet.update(list(msg))
pt_alphabet = list(pt_alphabet)

# Generate ciphertext alphabet with random-until-full method
ct_map, ct_alphabet = generate_ruf_ct_alphabet(pt_alphabet)

# print out both alphabets
print("\nCT Map:")
for l in pt_alphabet:
    print(f"{l}: {ct_map[l]}")
print(f"CT Alphabet {len(ct_alphabet)}: {''.join(ct_alphabet)}\n")
      
# Initialize CT msg for each PT message#
print("Processing PT to CT:")
ct_msgs = []
for pt_msg in pt_msgs:
    print(" - '" + pt_msg + "'")
    ct_current = {}
    for l in pt_alphabet:
        ct_current[l] = 0
    ct_msg = []
    
    # Add current CT map value to CT message
    for l in pt_msg:
        ct_msg += [ct_map[l][ct_current[l]]]

        # On a space rotate every CT map value
        if l == " ":
            for l2 in pt_alphabet:
                ct_current[l2] = (ct_current[l2] + 1) % len(ct_map[l2])
    ct_msgs += [ct_msg]

# Plot CT messages and gaps
locallib.crypto.plot_msgs(ct_msgs, True, title="CT Messages")
gaps = locallib.crypto.calc_gaps(ct_msgs, 6, True, False)
locallib.crypto.plot_im(gaps, True, title="CT Repeats, Gap Size < 6")
plt.show()

# Print full overview
locallib.crypto.full_overview(ct_msgs)
