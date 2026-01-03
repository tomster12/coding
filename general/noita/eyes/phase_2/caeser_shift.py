from shared import encode_caeser, text_difference


if __name__ == "__main__":
    """
    The output of a Caesar cipher is a fixed distance from the plaintext at each letter.
    """

    with open("example_plaintext.txt", "r") as f:
        pt_raw = f.read()
        pt_list = pt_raw.upper().splitlines()

    pt_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    shift = 2

    pt_1 = pt_list[0]
    pt_2 = pt_list[1]
    ct_1 = encode_caeser(pt_1, pt_alphabet, shift)
    ct_2 = encode_caeser(pt_2, pt_alphabet, shift)

    print("PT1:", pt_1)
    print("PT2:", pt_2)

    print("")

    print("CT1:", ct_1)
    print("CT2:", ct_2)

    print("")

    print("(CT1 - PT1):", text_difference(pt_1, ct_1, pt_alphabet))
    print("(CT2 - PT2):", text_difference(pt_2, ct_2, pt_alphabet))
    print("(CT2 - CT1):", text_difference(ct_1, ct_2, pt_alphabet))
