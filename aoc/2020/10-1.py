
def getJoltageDiffMult(filename):
    with open(filename) as f:
        nums = [int(x) for x in f.read()[:-1].splitlines()]
        nums.sort()
        nums = [0] + nums + [nums[-1] + 3]
        differences = {1: 0, 2: 0, 3: 0}
        current = nums[0]
        for i in range(1, len(nums)):
            differences[nums[i] - current] += 1
            current = nums[i]
        return differences[1] * differences[3]


if __name__ == "__main__":
    val = getJoltageDiffMult("10data.txt")
    print(f"Val: {val}")
