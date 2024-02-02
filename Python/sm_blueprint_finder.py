
import os
import json

blueprintsDir = "Blueprints/"
for filename0 in os.listdir(blueprintsDir):
    file = json.load(open(blueprintsDir+filename0+"/description.json"))
    print(filename0 + ": " + file["name"])
input()
