
def countCorrectPasswords(filename):
    with open(filename) as f:
        passwords = 0
        lines = f.readlines()
        for line in lines:
            splitLine = line.split(": ")
            word = splitLine[1][:-1]
            toFind = splitLine[0][-1]
            amountRaw = splitLine[0][:-2].split("-")
            amount = (int(amountRaw[0]), int(amountRaw[1]))
            letters = 0
            for letter in word:
                if letter == toFind:
                    letters += 1
            if amount[0] <= letters <= amount[1]:
                passwords += 1
        return passwords


if __name__ == "__main__":
    correct = countCorrectPasswords("2data.txt")
    print(correct)
