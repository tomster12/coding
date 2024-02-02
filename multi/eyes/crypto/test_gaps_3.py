
from locallib import eyeutil, analysis
import matplotlib.pyplot as plt
import numpy as np
import collections

# Setup data
msgs_gaps = analysis.calc_gaps(eyeutil.msgs_eye_tri, use_msg_value=False)
counter = collections.Counter()
for msg_gaps in msgs_gaps:
    m = [ int(x) for x in filter(lambda x: not np.isnan(x), msg_gaps) ]
    counter += collections.Counter(m)

x = range(1, 31)
for i in x:
    print(f"{i}: {counter[i]}")

y = [ counter[a] for a in x ]
plt.bar(x, y)
plt.show()