
import re


def getValidPassports(filename):
    valid = 0
    with open(filename) as f:
        # Setup checks
        checks = {
            "byr": lambda v: (len(v) == 4 and 1920 <= int(v) <= 2002),
            "iyr": lambda v: (len(v) == 4 and 2010 <= int(v) <= 2020),
            "eyr": lambda v: (len(v) == 4 and 2020 <= int(v) <= 2030),
            "hgt": lambda v: ((v[-2:] == "cm" and 150 <= int(v[:-2]) <= 193)
                              or (v[-2:] == "in" and 59 <= int(v[:-2]) <= 76)),
            "hcl": lambda v: (len(v) == 7 and v[0] == "#" and re.match("^[0-9a-f]*$", v[1:])),
            "ecl": lambda v: (v in ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"]),
            "pid": lambda v: (len(v) == 9 and re.match("^[0-9]*$", v))}

        # Setup passports
        rawPassports = f.read().split("\n\n")
        for p in rawPassports:
            values = re.split("\\n| ", p)
            currentChecks = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"]

            # Validate
            isValid = True
            for value in values:
                split = value.split(":")
                if split[0] != "cid":
                    currentChecks.remove(split[0])
                    if not checks[split[0]](split[1]):
                        isValid = False
                        break

            # Increment
            if len(currentChecks) == 0 and isValid:
                valid += 1
        return valid


if __name__ == "__main__":
    valid = getValidPassports("4data.txt")
    print(f"Valid: {valid}")
