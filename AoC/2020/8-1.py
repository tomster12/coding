
def finalAccAmount(filename):
    with open(filename) as f:
        lines = f.read()[:-1].splitlines()
        acc = 0
        pointer = 0
        runLines = []

        while True:
            if pointer in runLines:
                return acc
            split = lines[pointer].split(" ")
            rule = split[0]
            value = int(split[1])
            runLines.append(pointer)
            if rule == "acc":
                acc += value
                pointer += 1
            elif rule == "nop":
                pointer += 1
            elif rule == "jmp":
                pointer += value


if __name__ == "__main__":
    acc = finalAccAmount("8data.txt")
    print(f"Acc: {acc}")
