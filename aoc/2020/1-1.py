

def getMultForSumTo(filename, sum):
    with open(filename) as f:
        nums = [int(x) for x in f.readlines()]
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if (nums[i] + nums[j]) == sum:
                    return nums[i] * nums[j]


if __name__ == "__main__":
    val = getMultForSumTo("1data.txt", 2020)
    print(val)
