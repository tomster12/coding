
def getContainsGold(filename):
    with open(filename) as f:
        lines = f.read().splitlines()
        amount = 0
        rules = {}

        for line in lines:
            split = line.split(" ")
            colour = " ".join(split[:2])
            localRules = []

            for i in range(len(split) // 4 - 1):
                count = (split[4 + i * 4])
                otherColor = " ".join(split[(5 + i * 4):(7 + i * 4)])
                localRules.append([count, otherColor])
            rules[colour] = localRules

        def hasGold(bagName):
            localRules = rules[bagName]
            for rule in localRules:
                if rule[1] == "shiny gold":
                    return True
                elif hasGold(rule[1]):
                    return True
            return False

        for line in lines:
            split = line.split(" ")
            colour = " ".join(split[:2])
            if hasGold(colour):
                amount += 1

        return amount
    return 0


if __name__ == "__main__":
    amount = getContainsGold("7data.txt")
    print(f"Amount: {amount}")
