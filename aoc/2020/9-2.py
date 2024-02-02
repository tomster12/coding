
def getContiguousSumMinMax(filename, sumTarget):
    with open(filename) as f:
        nums = f.read()[:-1].splitlines()
        nums = [int(num) for num in nums]

        # Check each number to each number
        for i1 in range(len(nums)):
            min = nums[i1]
            max = nums[i1]
            sum = 0
            for i2 in range(i1, len(nums)):
                sum += nums[i2]
                if nums[i2] < min:
                    min = nums[i2]
                if nums[i2] > max:
                    max = nums[i2]
                if sum >= sumTarget:
                    break
            if sum == sumTarget:
                return min + max


if __name__ == "__main__":
    val = getContiguousSumMinMax("9data.txt", 1492208709)
    print(f"Val: {val}")
