import subprocess


def get_git_log(count):
    # Get commit hashes and dates
    raw_output = subprocess.check_output(
        ["git", "log", "--pretty=format:%ad %H", "--date=short", f"-{count}"],
        text=True
    )

    raw_lines = raw_output.strip().split("\n")
    data = []

    for line in raw_lines:
        log_date, log_commit_hash = line.strip().split(maxsplit=1)

        # Get numstat For this commit
        try:
            count_output = subprocess.check_output(
                ["git", "show", "--numstat", "--format=", log_commit_hash],
                text=True
            )
        except subprocess.CalledProcessError:
            continue

        # Process the numstat output
        added = 0
        removed = 0
        for stat_line in count_output.strip().split("\n"):
            parts = stat_line.strip().split("\t")
            if len(parts) != 3:
                continue
            a, r, _ = parts
            if a != "-" and r != "-":  # binary files show "-" instead of numbers
                added += int(a)
                removed += int(r)

        data.append([log_date, log_commit_hash, added, removed])

    # Print the final output
    print("\n".join(
        f"{log_date} {log_commit_hash} +{added:<4} -{removed}"
        for log_date, log_commit_hash, added, removed in data
    ))

    print(f"Commits: {count}, Dates: ({data[-1][0]} -> {data[0][0]}), Total changes: +{sum(x[2] for x in data)} -{sum(x[3] for x in data)}")


if __name__ == "__main__":
    get_git_log(60)
