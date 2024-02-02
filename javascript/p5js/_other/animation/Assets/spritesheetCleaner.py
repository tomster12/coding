
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
        del data["frames"][frameName]["rotated"]
        del data["frames"][frameName]["trimmed"]
        if ("spriteSourceSize" in data["frames"][frameName]):
            del data["frames"][frameName]["spriteSourceSize"]
        if ("sourceSize" in data["frames"][frameName]):
            del data["frames"][frameName]["sourceSize"]

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

    # - Delete colour for tags
    for slice in data["meta"]["slices"]:
        del slice["color"]
        for key in slice["keys"]:
            key["active"] = key["bounds"]["x"] >= 0

    # Rewrite meta data back to file
    print("Rewriting metadata...")
    with open(spritesheet, "w") as f2:
        json.dump(data, f2)
    print("\nFinished cleaning spritesheet")


# Main
wanted = getWantedSpritesheet()
if wanted is not None:
    cleanSpritesheet(wanted)
