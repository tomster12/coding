
import string

def get_fibs(n):
    nums = [0, 1]
    for i in range(2, n+1):
        nums.append(nums[-1] + nums[-2])
    return nums

nums = get_fibs(2100)
for i in range(int(len(nums) / 21)):
    output = "".join([ string.ascii_lowercase[nums[i * 21 + o] % 26] for o in range(21) ])
    print(output)
