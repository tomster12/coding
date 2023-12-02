
word_digit_map = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9
}

with open("1-data.txt") as f:
    lines = f.read().splitlines()
    sum = 0

    for line in lines:
        
        l_digit = None
        for l_index in range(len(line)):
            for word in word_digit_map:
                if l_index + len(word) <= len(line):
                    if line[l_index:l_index + len(word)] == word:
                        l_digit = word_digit_map[word]
                        break
                if l_digit is not None:
                    break
            if l_digit is not None:
                break

            if line[l_index].isdigit():
                l_digit = int(line[l_index])
                break

        r_digit = None
        for r_index in range(len(line) - 1, -1, -1):
            for word in word_digit_map:
                if r_index - len(word) >= 0:
                    if line[r_index - len(word) + 1:r_index + 1] == word:
                        r_digit = word_digit_map[word]
                        break
                if r_digit is not None:
                    break
            if r_digit is not None:
                break

            if line[r_index].isdigit():
                r_digit = int(line[r_index])
                break

        sum += l_digit * 10 + r_digit

    print(sum)
