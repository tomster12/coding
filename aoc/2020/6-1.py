
def sumYesAnswers(filename):
    with open(filename) as f:
        sum = 0
        groups = f.read().split("\n\n")
        for group in groups:
            answers = {}
            people = group.split("\n")
            print(f"People: {people}")
            for person in people:
                for answer in person:
                    if answer not in answers:
                        answers[answer] = True
            amount = len(answers.keys())
            sum += amount
        return sum
    return 0


if __name__ == "__main__":
    sum = sumYesAnswers("6data.txt")
    print(f"Sum: {sum}")
