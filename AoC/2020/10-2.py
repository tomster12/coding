
def getNumJoltageConfigs(filename):
    with open(filename) as f:
        # Get numbers and initialize variables
        nums = [int(x) for x in f.read()[:-1].splitlines()]
        nums.sort()
        nums = [0] + nums + [nums[-1] + 3]
        waysFrom = {}

        def countWays(index):
            # Reached end so propogate backwards
            if index == len(nums) - 1:
                return 1

            # Ways already found for index
            if index in waysFrom:
                return waysFrom[index]

            # Check each potential element
            sum = 0
            for i in range(index + 1, min(len(nums) - 1, index + 3) + 1):
                if not nums[i] <= (nums[index] + 3):
                    break
                sum += countWays(i)

            # Store then return sum for index
            waysFrom[index] = sum
            return sum

        # Count ways from beginning
        return countWays(0)


if __name__ == "__main__":
    num = getNumJoltageConfigs("10data.txt")
    print(f"Num: {num}")
