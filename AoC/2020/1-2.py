

def getMultForSumTo(filename, sum):
    with open(filename) as f:
        nums = [int(x) for x in f.readlines()]
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                for k in range(j + 1, len(nums)):
                    if (nums[i] + nums[j] + nums[k]) == sum:
                        return nums[i] * nums[j] * nums[k]


if __name__ == "__main__":
    val = getMultForSumTo("1data.txt", 2020)
    print(val)
