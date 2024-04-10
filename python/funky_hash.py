
p0 = (0b0, 0b00)
p1 = (0b1, 0b00)
p2 = (0b0, 0b01)
p3 = (0b0, 0b10)
p4 = (0b1, 0b10)


def hash(p):
    return p[0] ^ (p[1] << 1)


hp0 = hash(p0)
hp1 = hash(p1)
hp2 = hash(p2)
hp3 = hash(p3)
hp4 = hash(p4)


print(hp0 == hp0)  # True
print(hp0 == hp1)  # False
print(hp0 == hp2)  # False
print(hp0 == hp3)  # False
print(hp0 == hp4)  # False

print("")
print(hp1 == hp1)  # True
print(hp1 == hp2)  # False
print(hp1 == hp3)  # False
print(hp1 == hp4)  # True

print("")
print(hp2 == hp2)  # True
print(hp2 == hp3)  # False
print(hp2 == hp4)  # False

print("")
print(hp3 == hp3)  # True
print(hp3 == hp4)  # True
