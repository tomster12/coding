
def accAfterFix(filename):
    with open(filename) as f:
        lines = f.read()[:-1].splitlines()
        swap = ["jmp", "nop"]

        for i in range(len(lines)):
            if lines[i][:3] in swap:
                newLines = [line for line in lines]
                newLines[i] = swap[swap.index(lines[i][:3]) - 1] + lines[i][3:]
                acc = 0
                pointer = 0
                runLines = []

                while True:
                    if pointer >= len(lines):
                        return acc
                    if pointer in runLines:
                        break
                    rule = newLines[pointer][:3]
                    value = int(newLines[pointer][4:])
                    runLines.append(pointer)
                    if rule == "acc":
                        acc += value
                        pointer += 1
                    elif rule == "nop":
                        pointer += 1
                    elif rule == "jmp":
                        pointer += value


if __name__ == "__main__":
    acc = accAfterFix("8data.txt")
    print(f"Acc: {acc}")
