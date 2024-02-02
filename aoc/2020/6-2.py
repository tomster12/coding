
def sumYesAnswers(filename):
    with open(filename) as f:
        sum = 0
        groups = f.read()[:-1].split("\n\n")
        for group in groups:
            answers = {}
            people = group.split("\n")
            print(f"People: {people}")
            for person in people:
                for answer in person:
                    if answer not in answers:
                        answers[answer] = 0
                    answers[answer] += 1
            print(f"Answers: {answers}")
            for answer in answers:
                if answers[answer] == len(people):
                    print(f"Full: {answer}")
                    sum += 1
        return sum
    return 0


if __name__ == "__main__":
    sum = sumYesAnswers("6data.txt")
    print(f"Sum: {sum}")
