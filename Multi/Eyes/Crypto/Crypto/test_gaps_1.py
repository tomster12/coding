
from locallib import eyeutil, crypto
import matplotlib.pyplot as plt
import numpy as np
import collections

# Setup data
gaps = {}
alphabet = np.arange(83)
messages = eyeutil.msgs_eye_tri
# alphabet = np.arange(125)
# messages, _ = eyeutil.generate_random_msgs_tri()
print(messages)
for l1 in alphabet:
    gaps[l1] = {}
    for l2 in alphabet:
        gaps[l1][l2] = []

inv_gaps = {}
for i in range(137):
    inv_gaps[i] = []

# Extract gap sizes
for msg in messages:
    for i1 in range(len(msg)):
        l1 = msg[i1]
        for i2 in range(i1 + 1, len(msg)):
            l2 = msg[i2]
            gaps[l1][l2].append(i2 - i1)
            inv_gaps[i2 - i1].append((l1, l2))

# Caculate counters
counts = {}
for l1 in alphabet:
    counts[l1] = {}
    for l2 in alphabet:
        c = collections.Counter(gaps[l1][l2])
        counts[l1][l2] = c

        # Congruent stuff
        total = sum(c.values())
        if total > 1:
            s = sorted(c.keys())
            found = True
            for i in range(len(s) - 1):
                if s[i] + 1 != s[i + 1]:
                    found = False
                    break
            if found:
                print(f"{l1}:{l2}, unique gap sizes={len(c.keys())}, gaps={c}")

xlim = max([ max(counts[l1][l2].keys()) for l1 in alphabet for l2 in alphabet if counts[l1][l2] != collections.Counter() ])
ylim = max([ max(counts[l1][l2].values()) for l1 in alphabet for l2 in alphabet if counts[l1][l2] != collections.Counter() ])

# Trigram diff stuff
# for diff in range(len(alphabet)):
#     key_lists = [ list(counts[x][x+diff].keys()) for x in range(len(alphabet)-diff) ]
#     all_keys = [ k for keys in key_lists for k in keys ]
#     value_lists = [ list(counts[x][x+diff].values()) for x in range(len(alphabet)-diff) ]
#     all_values = [ k for values in value_lists for k in values ]
#     print(f"trigram diff={diff}, total gaps={len(all_values)}, min gap={np.min(all_keys)}, max gap={np.max(all_keys)}, mean gap={np.mean(all_keys)},\t median gap = {np.median(all_keys)}")

# Gap size trigrams stuff
# for gap in inv_gaps:
#     unique_from = list(set([ a[0] for a in inv_gaps[gap] ]))
#     unique_to = list(set([ a[1] for a in inv_gaps[gap] ]))
#     print(f"Gap {gap}, unique from: {len(unique_from)}, unique to: {len(unique_to)}")

# Draw graph
def draw():
    x_size = xlim
    y_size = ylim
    border = x_size * 0.1
    ax = plt.subplot(111)
    plt.setp(ax, "frame_on", False)
    ax.set_xlim([0, len(alphabet) * (x_size + border) ])
    ax.set_ylim([0, len(alphabet) * (y_size + border) ])
    ax.set_xticks([])
    ax.set_yticks([])
    ax.grid("off")

    for l1 in alphabet:
        ax.annotate(l1, (-5, l1 * (y_size + border)), size=10, ha="right", va="bottom", annotation_clip=False)
        for l2 in alphabet:
            x = np.arange(x_size)
            y = [ counts[l1][l2][a] for a in x ]
            ax.plot(
                x + l2 * (x_size + border),
                y + l1 * (y_size + border),
                ls="-", lw=1, c="r")
            ax.annotate(f"{l1}:{l2}", (l2 * (x_size + border) + x_size * 0.5, l1 * (y_size + border) - 5), size=10, ha="center", va="top", annotation_clip=False)

    plt.tight_layout()
    ax.figure.set_figwidth(100)
    ax.figure.set_figheight(100)
    plt.savefig("test_gaps_1.png", dpi=140)
    # plt.show()
draw()
