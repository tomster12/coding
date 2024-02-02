
def getHitTrees(filename, slopeX, slopeY):
    with open(filename) as f:
        lines = f.read().splitlines()
        x = y = 0
        width = len(lines[0])
        hit = 0
        while True:
            if lines[y][x] == "#":
                hit += 1
            x = (x + slopeX) % width
            y += slopeY
            if y >= len(lines):
                break
        return hit


if __name__ == "__main__":
    slopes = [
        [1, 1],
        [3, 1],
        [5, 1],
        [7, 1],
        [1, 2]]
    result = 1
    for slope in slopes:
        count = getHitTrees("3data.txt", slope[0], slope[1])
        print(f"hit {count} for slope {slope[0]}, {slope[1]}")
        result *= count
    print(f"Multiplied = {result}")
