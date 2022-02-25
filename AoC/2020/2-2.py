
def countCorrectPasswords(filename):
    with open(filename) as f:
        passwords = 0
        lines = f.readlines()
        for line in lines:
            splitLine = line.split(": ")
            word = splitLine[1][:-1]
            toFind = splitLine[0][-1]
            indicesRaw = splitLine[0][:-2].split("-")
            indices = (int(indicesRaw[0]), int(indicesRaw[1]))
            if (word[indices[0] - 1] == toFind) != (word[indices[1] - 1] == toFind):
                passwords += 1
        return passwords


if __name__ == "__main__":
    correct = countCorrectPasswords("2data.txt")
    print(correct)
