
import random

num = 1000000
count = 0

deck = []
for b in range(26):
    deck.append(0)
for r in range(26):
    deck.append(1)
for j in range(2):
    deck.append(2)

for i in range(num):
    localDeck = deck.copy()
    stacks = [[], [], [], [], [], []]
    matchingStacks = [0, 0]

    for o in range(9):
        for p in range(6):
            choiceInd = random.randint(0, len(localDeck) - 1)
            choice = localDeck.pop(choiceInd)
            stacks[p].append(choice)

    for stack in stacks:
        stackSuits = [1, 1]
        for card in stack:
            if card != 0:
                stackSuits[0] = 0
            if card != 1:
                stackSuits[1] = 0
        matchingStacks[0] += stackSuits[0]
        matchingStacks[1] += stackSuits[1]

    if matchingStacks[0] >= 1 and matchingStacks[1] >= 1:
        print(stacks)
        count += 1

print(f"{count} / {num}")
