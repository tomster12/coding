
from locallib import eyeutil, crypto
import matplotlib.pyplot as plt
import numpy as np


crypto.plot_im(
    im=crypto.conv_msgs_to_im(eyeutil.msgs_eye_tri),
    to_label=True,
    title="Eyes",
    figsize=(28,2))

# shared_im = crypto.calc_shared(
#     msgs=eyeutil.msgs_eye_tri,
#     to_zero=True)
# crypto.plot_im(
#     im=shared_im,
#     to_label=True,
#     labels=eyeutil.msgs_eye_tri,
#     title="Shared Sections",
#     to_dull=True,
#     under_value=1,
#     figsize=(28,2))

# gap_im = crypto.calc_gaps(
#     msgs=eyeutil.msgs_eye_tri,
#     limit=16,
#     include_end=True,
#     use_msg_value=False,
#     to_zero=True)
# crypto.plot_im(
#     im=gap_im,
#     to_label=True,
#     labels=eyeutil.msgs_eye_tri,
#     title="Gaps",
#     to_dull=True,
#     figsize=(28,2))
# crypto.plot_im(
#     im=gap_im,
#     to_label=True,
#     title="Gaps (Sizes)",
#     to_dull=True,
#     figsize=(28,2))

# msgs = eyeutil.msgs_eye_tri[0:9]
# msgs = eyeutil.msgs_eye_tri[0:3]
# msgs = eyeutil.msgs_eye_tri[3:6]
# msgs = eyeutil.msgs_eye_tri[6:9]
# isos = crypto.calc_isomorphs(msgs)
# isos_im = crypto.conv_isomorphs_to_img(msgs, isos, 0)
# crypto.plot_im(
#     im=isos_im,
#     to_label=True,
#     to_dull=True,
#     labels=msgs,
#     title="(1-3) Isomorphs",
#     figsize=(28,2))

plt.show()
