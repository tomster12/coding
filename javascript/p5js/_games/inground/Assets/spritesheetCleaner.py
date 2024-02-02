
# Asesprite export settings
# Sheet Type: By Rows
# Constraints: None
# Merge duplicates OFF
# Ignore Empty OFF

# Layers: Visible layers: Split Layers OFF
# Frames: All frames: Split Tags ON

# Borders: all 0, all OFF

# Hash: Meta: Layers OFF, Tags ON, Slices ON
# Item Filename: #{tag} {frame}.{extension}

# Imports
import os
import json


# Functions
def isInt(value):
    # Checks if integer
    try:
        int(value)
        return True
    except ValueError:
        return False


def getWantedSpritesheet():
    # Find all spritesheets in folder
    options = []
    print("\nFinding potential spritesheets...")
    for file in os.listdir("./"):
        if file.endswith(".json"):
            options.append(file)
            print(f"Potential sheet ({len(options)}): {file}")

    # - No sheets found
    if len(options) == 0:
        print("No spritesheets found")
        return None

    # Get users desired sheet
    while True:
        opt = input("Enter your desired spritesheet: ")
        if not isInt(opt) or not (0 < int(opt) <= len(options)):
            print("Invalid input")
            continue
        return options[int(opt) - 1]


def cleanSpritesheet(spritesheet):
    print(f"\nCleaning spritesheet {spritesheet}")

    # Read data from file
    print("Parsing json...")
    with open(spritesheet, "r") as f1:
        data = json.load(f1)

    # Clean data
    # - Delete extra frame data
    print("Cleaning metadata...")
    for frameName in data["frames"]:
        del data["frames"][frameName]["spriteSourceSize"]
        del data["frames"][frameName]["sourceSize"]
        del data["frames"][frameName]["rotated"]
        del data["frames"][frameName]["trimmed"]

    # - Delete extra meta data
    del data["meta"]["app"]
    del data["meta"]["version"]
    del data["meta"]["format"]
    del data["meta"]["scale"]

    # - Delete direction and add type for tags
    for tag in data["meta"]["frameTags"]:
        del tag["direction"]
        while True:
            opt = input(f"'{tag['name']}' animation type, single (1), loop(2): ")
            if opt not in ["1", "2"]:
                print("Invalid input")
                continue
            break
        tag["type"] = "single" if opt == "1" else "loop"

    # - Delete uneccessary slices and deactivate ones offscreen
    for slc in data["meta"]["slices"]:
        del slc["color"]
        index = 0
        while index < len(slc["keys"]):
            slc["keys"][index]["active"] = slc["keys"][index]["bounds"]["x"] >= 0
            if index > 0:
                sameX = slc["keys"][index - 1]["bounds"]["x"] == slc["keys"][index]["bounds"]["x"]
                sameY = slc["keys"][index - 1]["bounds"]["y"] == slc["keys"][index]["bounds"]["y"]
                if sameX and sameY:
                    del slc["keys"][index]
                    index -= 1
                if slc["keys"][index]["frame"] == slc["keys"][index - 1]["frame"]:
                    del slc["keys"][index - 1]
                    index -= 1
            index += 1

    # Rewrite meta data back to file
    print("Rewriting metadata...")
    with open(spritesheet, "w") as f2:
        json.dump(data, f2)
    print("\nFinished cleaning spritesheet")


# Main
wanted = getWantedSpritesheet()
if wanted is not None:
    cleanSpritesheet(wanted)
