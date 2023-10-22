
import random
import matplotlib.pyplot as plt
from locallib import analysis, crypto

# Set seed and initialize data
random.seed(1)
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

# Parse PT alphabet
pt_msgs = [ msg.lower() for msg in pt_msgs_raw ]
pt_a = set()
for msg in pt_msgs:
    pt_a.update(list(msg))
pt_a = sorted(list(pt_a))

# Setup cipher
cipher = crypto.RotatingHomophonicCipher(pt_a)

# Encode all messages
ct_msgs = [ cipher.encode(pt) for pt in pt_msgs ]

# Full overview
# analysis.full_overview(ct_msgs)

# Gap frequency
# analysis.plot_gap_freq(ct_msgs)
# plt.show()

# Straight messages
analysis.plot_im(
    im=analysis.conv_msgs_to_im(ct_msgs),
    to_label=True,
    title="Messages",
    figsize=(50,2.4))

# Shared sections
shared_im = analysis.calc_shared(
    msgs=ct_msgs,
    to_zero=True)
analysis.plot_im(
    im=shared_im,
    to_label=True,
    labels=ct_msgs,
    title="Shared Sections",
    to_dull=True,
    under_value=1,
    figsize=(50,2.4))

# Gaps
gap_im = analysis.calc_gaps(
    msgs=ct_msgs,
    limit=16,
    include_end=True,
    use_msg_value=False,
    to_zero=True)
analysis.plot_im(
    im=gap_im,
    to_label=True,
    labels=ct_msgs,
    title="Gaps",
    to_dull=True,
    figsize=((50,2.4)))
analysis.plot_im(
    im=gap_im,
    to_label=True,
    title="Gaps (Sizes)",
    to_dull=True,
    figsize=((50,2.4)))

# Isomorphs
# msgs = ct_msgs[0:9]
msgs = ct_msgs[0:3]
# msgs = ct_msgs[3:6]
# msgs = ct_msgs[6:9]
isos = analysis.calc_isomorphs(msgs)
isos_im = analysis.conv_isomorphs_to_img(msgs, isos, 0)
analysis.plot_im(
    im=isos_im,
    to_label=True,
    to_dull=True,
    labels=msgs,
    title="Isomorphs",
    figsize=((28,1.6)))

plt.show()
