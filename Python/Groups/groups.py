
with open("groups.txt") as f:
    subjects = ["DAT", "SOF", "THE", "HCI", "SYS"]
    groups = {"DAT": {}, "SOF": {}, "THE": {}, "HCI": {}, "SYS": {}}

    people = []
    lines = f.read().splitlines()
    currentPerson = None
    for line in lines:

        if "Today at " in line:
            spl = line.split("Today at ")
            currentPerson = spl[0]
            print(f"Name: {currentPerson}")

        else:
            print(f"Checking line {line}")
            for subject in subjects:
                if subject in line:
                    number = line.split(" ")[-1]
                    if number not in groups[subject]:
                        groups[subject][number] = []
                    groups[subject][number].append(currentPerson)

    for subject in subjects:
        print(f"\n------------------ {subject} ------------------")
        for group in groups[subject]:
            print(f"\n  Group {group}")
            for person in groups[subject][group]:
                print(f"    {person}")
