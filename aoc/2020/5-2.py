
def getSeatInformation(seat):
    rowChoices = seat[:7]
    columnChoices = seat[7:]
    row = int("".join([("1" if x == "B" else "0") for x in rowChoices]), 2)
    column = int("".join([("1" if x == "R" else "0") for x in columnChoices]), 2)
    id = row * 8 + column
    return (row, column, id)


def findMissingSeatID(filename):
    with open(filename) as f:
        ids = []
        lines = f.read().splitlines()
        for seat in lines:
            info = getSeatInformation(seat)
            print(f"{seat} gives {info}")
            ids.append(info[2])
        ids.sort()
        for i in range(len(ids) - 1):
            if ids[i + 1] != (ids[i] + 1):
                return ids[i] + 1
    return 0


if __name__ == "__main__":
    missing = findMissingSeatID("5data.txt")
    print(f"Missing: {missing}")
