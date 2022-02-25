
def getIncorrectValue(filename, preamableLength):
    with open(filename) as f:
        nums = f.read()[:-1].splitlines()
        nums = [int(num) for num in nums]
        numPool = nums[:preamableLength]

        # Check each number
        current = preamableLength
        while True:
            checking = nums[current]
            found = False

            # Check each number in pool
            for i1 in range(preamableLength):
                for i2 in range(i1 + 1, preamableLength):
                    if (numPool[i1] + numPool[i2]) == checking:
                        found = True
                        break
                if found:
                    break

            # Number doesn't have a sum pair
            if not found:
                return checking

            # Increment
            numPool.pop(0)
            numPool.append(checking)
            current += 1
            if current >= len(nums):
                return False


if __name__ == "__main__":
    val = getIncorrectValue("9data.txt", 25)
    print(f"Val: {val}")
