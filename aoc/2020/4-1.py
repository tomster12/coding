
import re


def getValidPassports(filename):
    valid = 0
    with open(filename) as f:
        # Setup checks
        toCheck = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"]

        # Setup passports
        rawPassports = f.read().split("\n\n")
        for p in rawPassports:
            values = re.split("\\n| ", p)
            isValid = True

            # Validate
            for check in toCheck:
                if check not in [v.split(":")[0] for v in values]:
                    isValid = False
                    break

            # Increment
            if isValid:
                valid += 1
    return valid


if __name__ == "__main__":
    valid = getValidPassports("4data.txt")
    print(f"Valid: {valid}")
