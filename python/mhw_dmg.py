
while True:
    aff = float(input("Affinity (decimal): "))
    dmg = int(input("Damage: "))

    output = 0
    
    if aff > 0:
        output = (dmg * (1 - aff)) + (dmg * 1.25 * aff)
        
    else:
        output = (dmg * (1 + aff)) + (dmg * 0.75 * -aff)
        
    print("Average damage: " + str(output) + "\n")
