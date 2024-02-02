
def getGoldContains(filename):
    with open(filename) as f:
        lines = f.read().splitlines()
        amount = 0
        rules = {}

        for line in lines:
            split = line.split(" ")
            colour = " ".join(split[:2])
            localRules = []

            for i in range(len(split) // 4 - 1):
                count = int(split[4 + i * 4])
                otherColor = " ".join(split[(5 + i * 4):(7 + i * 4)])
                localRules.append([count, otherColor])
            rules[colour] = localRules

        def countBags(bagName):
            localRules = rules[bagName]
            sum = 1
            for rule in localRules:
                sum += rule[0] * countBags(rule[1])
            return sum

        return countBags("shiny gold")
    return 0


if __name__ == "__main__":
    amount = getGoldContains("7data.txt")
    print(f"Amount: {amount}")
