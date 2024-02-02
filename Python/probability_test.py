
import random
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import scipy
from scipy.interpolate import interp1d

# Raw values
rawY = np.asarray([0, 2, 7, 50, 10, 0, 4, 8, 18, 15, 20, 3, 0])

# Get sample x-y
sampleX = np.arange(0, len(rawY), 1)
sampleY = np.interp(rawY, (rawY.min(), rawY.max()), (0, 1))
sampleXtoY = interp1d(sampleX, sampleY, kind="cubic")

# Get interpolated x-y
smoothX = np.arange(0.0, len(rawY)-1, 0.01)
smoothY = sampleXtoY(smoothX).clip(0)

# Get normalized cumulative interpolated x-y
normCumSmoothY = np.cumsum(smoothY) / np.sum(smoothY)
normCumSmoothYtoX = interp1d(normCumSmoothY, smoothX)

# Plot
plt.plot(
    sampleX, sampleY, "bo",
    smoothX, smoothY, "-",
    smoothX, normCumSmoothY, "--")

for i in range(200):
    r = random.uniform(0, 1)
    x = normCumSmoothYtoX(r)
    y = sampleXtoY(x)
    plt.scatter(x, y, c="r")
