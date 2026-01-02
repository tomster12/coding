
from locallib import eyeutil, analysis
import matplotlib.pyplot as plt
import numpy as np
import collections

gaps = {}
alphabet = range(83)
max_gaps = max([ len(msg) for msg in eyeutil.msgs_eye_tri ])

for l1 in alphabet:
    gaps[l1] = {}
    for gap in range(max_gaps):
        gaps[l1][gap] = []

for msg in eyeutil.msgs_eye_tri:
    for i1 in range(len(msg)):
        for i2 in range(i1 + 1, len(msg)):
            gaps[msg[i1]][i2 - i1].append(msg[i2])

# for l1 in alphabet:
l1 = 0
fig, axs = plt.subplots(1, max_gaps)

for gap in range(max_gaps):
    counts = collections.Counter(gaps[l1][gap])
    y = [ counts[l] for l in alphabet ]

    ax = axs[gap]
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_ylim(0, 3)
    ax.title.set_text(gap)
    ax.plot(alphabet, y)


fig.suptitle(f"Letter {l1}")
fig.set_figwidth(90)
fig.set_figheight(5)
fig.tight_layout()
plt.show()
