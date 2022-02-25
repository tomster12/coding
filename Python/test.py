
# Import packages
import matplotlib
import matplotlib.pyplot as plt
import numpy as np

# [-1.00, -0.99, ..., 0.99, 1.00]       - Make array between -1.0 and 1.0 with increments of 0.01
x = np.arange(-1.0, 1.0, 0.01)

# [t[0]*t[0], t[1]*t[1], ...]           - Make array same size as t, where the values are t * t
y = x * x

# Plt.subplots() = [figure, axes]       - create 2 variables which are linked to a graph, fig and ax
fig, ax = plt.subplots()

# Plot x against y on the axes          - Actually put the variables onto the graph, the size will be smallest possible
ax.plot(x, y)

# Set labels                            - Self explanatory, change the labels on the axes
ax.set(xlabel="x", ylabel="y", title="simple plot")

# Size of axes to show                  - Change the size of the graph, despite the range of the values given
ax.set_xlim([-2.0, 2.0])
ax.set_ylim([-0.5, 1.5])
