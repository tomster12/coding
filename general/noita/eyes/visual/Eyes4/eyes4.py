
alphabet = "abcdefghijklmnopqrstuvwxyz"
plaintext = "thisisamessage"
keys = [ "a", "s", "m" ]
encoding = [ 50, 66, 5, 48, 62, 13, 75, 29, 24, 61, 42, 70, 66, 62, 32, 14, 81, 8, 15, 78, 2, 29, 13, 49, 1 ]

for i in range(len(keys)):
    key = keys[i]
    keyVal = alphabet.index(key)

    position = 0
    ciphertext = []
    ciphertext.append(encoding[keyVal % len(encoding)])
    for o in range(len(plaintext)):
        letter = plaintext[o]

        if letter == key:
            position = (position + keyVal) % len(encoding)
            ciphertext.append(encoding[position])
            position = (position + 1) % len(encoding)
            
        ciphertext.append(encoding[position])
        position = (position + 1) % len(encoding)
    
    print(ciphertext)