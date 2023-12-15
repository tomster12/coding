with open("1-data.txt") as f:
    lines = f.read().splitlines()
    sum = 0

    for line in lines:
        line_numeric = [ c.isdigit() for c in line ]
        l_digit = int(line[line_numeric.index(True)])
        r_digit = int(line[len(line) - 1 - line_numeric[::-1].index(True)])
        sum += l_digit * 10 + r_digit

    print(sum)
