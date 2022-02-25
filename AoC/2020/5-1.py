
def getSeatInformation(seat):
    rowChoices = seat[:7]
    columnChoices = seat[7:]
    row = int("".join([("1" if x == "B" else "0") for x in rowChoices]), 2)
    column = int("".join([("1" if x == "R" else "0") for x in columnChoices]), 2)
    id = row * 8 + column
    return (row, column, id)


def maxSeatID(filename):
    with open(filename) as f:
        max = 0
        lines = f.read().splitlines()
        for seat in lines:
            info = getSeatInformation(seat)
            print(f"{seat} gives {info}")
            if info[2] > max:
                max = info[2]
        return max
    return 0


if __name__ == "__main__":
    max = maxSeatID("5data.txt")
    print(f"Max: {max}")
