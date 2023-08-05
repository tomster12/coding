
# Lymm CW Top Alt
# - - - 0 0 0 0 0 0 0 -
# - - 0 0 0 0 0 0 0 0 -
# - 0 1 1 1 0 1 1 1 1 0
# - - 1 1 1 0 1 1 1 - -
# - 0 0 0 0 0 0 0 0 0 -
# 0 1 0 1 0 1 0 1 0 1 0
# 1 0 1 0 1 0 1 0 1 - -

# NPC CW Top
# - - - 0 0 0 0 0 0 0 - 
# - - 0 0 0 0 0 0 0 0 -
# - 0 0 0 0 0 0 0 0 0 1
# - - 0 1 0 1 0 1 0 - -
# - 1 0 1 0 1 0 1 0 1 - 
# 0 1 0 0 1 1 1 0 1 1 1 
# 1 0 1 1 1 0 1 1 1 - -

# Gonzo CW Right
# - - - 0 0 0 0 0 0 0 - 
# - - 0 0 0 0 0 0 0 0 -
# - 0 0 0 0 0 0 0 0 0 1
# - - 0 1 0 1 0 1 0 - -
# - 1 0 1 0 1 0 1 0 1 - 
# 0 1 0 1 1 1 1 0 1 1 1 
# 0 1 1 1 0 1 1 1 0 - -

# Gonzo CCW Right
# - - - 0 0 0 0 0 0 0 - 
# - - 0 0 0 0 0 0 0 0 -
# - 0 0 0 0 0 0 0 0 0 0
# - - 1 0 1 0 1 0 1 - -
# - 0 1 0 1 0 1 0 1 0 - 
# 1 0 1 0 1 1 1 0 1 1 1 
# 0 1 1 1 0 1 1 1 1 - -

# --------------------------------------------

portal_cols = 11
portals = [ [3, 7], [2, 8], [1, 10], [2, 7], [1, 9], [0, 11], [0, 9] ]
standard_order = [ 0, 1, 2, 3, 4, 5, 6 ]
lymm_order = [ 0, 1, 4, 5, 6, 2, 3 ]

def get_pattern(rings, order=standard_order, to_print=False):
    ring_list = "".join(rings)
    index = 0
    outputs = []
    for ri in order:
        output = []
        for c in range(portal_cols):
            if c < portals[ri][0] or c >= (portals[ri][0] + portals[ri][1]):
                output += "-"
            else:
                output += ring_list[index]
                index += 1
        outputs.append(output)
        if to_print:
            print(" ".join(output))
    return outputs

all_rings = []
for i in range(2):
    for o in range(4):
        ring0 = "000000000000000000000000"
        ring1 = "1010101010101010101"
        ring1 = ("0" + ring1) if i == 0 else (ring1 + "1")
        ring2raw = ["111", "111", "111"]
        ring2raw.insert(o, "1111")
        ring2 = "0" + "0".join(ring2raw)
        rings = [ring0, ring1, ring2]
        all_rings.append(rings)
        print(rings)

print("\nAll Standard reading orders:")
for ring in all_rings:
    print("")
    print(ring)
    get_pattern(ring, standard_order, True)
    
print("\nAll Lymm reading orders:")
for ring in all_rings:
    print("")
    print(ring)
    get_pattern(ring, lymm_order, True)

# def match(x, y):
#     return get_pattern(all_rings[x], standard_order) == get_pattern(all_rings[y], standard_order)
# grid = [ [ match(x, y) for y in range(8) ] for x in range(8) ]
# for row in grid:
#     print(row)
# print("\nReading CW from top\n")
# get_pattern(all_rings[5], standard_order, True)
