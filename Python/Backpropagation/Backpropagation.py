
import matplotlib
import matplotlib.pyplot as plt
import numpy as np


    # Get file
location = "C:/Users/tombu/Files/Coding/py/Backpropagation/data.txt"
rawData = open(location, "r")
lines = [string.replace("\n","") for string in rawData.readlines()]


    # Parse data
data = []
dataIndex = dataSubIndex = -1;
for i in range(0, len(lines)):
    string = lines[i]

    if string == "data":
        data.append([])
        dataIndex += 1
        dataSubIndex = -1

    elif string == "next":
        data[dataIndex].append([])
        dataSubIndex += 1

    else:
        data[dataIndex][dataSubIndex].append(float(string))
errorData = (data.pop())[0]


        # Graph data
# for case in data:
#     plt.scatter(case[0][0], case[0][1], color=("orange" if case[1][0] > 0.5 else "blue")) # XOR Graph

# for case in data:
#     plt.scatter(case[0][0], case[2][0], color="orange")
# for case in data:
#     plt.scatter(case[0][0], case[1][0], color="blue") # Function graph

for i in range(len(errorData)):
    plt.scatter(i, errorData[i]) # Error Graph
