
size = float(input("How many GB: "))
rate = float(input("What speed (MB/s): "))
print(str((size * 1024) / rate) + " Seconds")
print(str(((size * 1024) / rate) / 60) + " Minutes")
input()
