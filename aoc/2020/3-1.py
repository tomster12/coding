
def getHitTrees(filename):
    with open(filename) as f:
        lines = f.read().splitlines()
        x = y = 0
        width = len(lines[0])
        hit = 0
        while True:
            if lines[y][x] == "#":
                hit += 1
            x = (x + 3) % width
            y += 1
            if y >= len(lines):
                break
        return hit


if __name__ == "__main__":
    count = getHitTrees("3data.txt")
    print(count)
