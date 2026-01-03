from shared import calculate_pattern, highlight_pattern, encode_caeser, text_difference


if __name__ == "__main__":
    """
    The output of a Caesar cipher is isomorphic to the plaintext.

    This means that the pattern of letter occurrences in the plaintext
    is preserved in the ciphertext.
    """

    pt_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    pt = "ATTACKATDAWN"

    pattern = calculate_pattern(pt)
    ct = encode_caeser(pt, pt_alphabet, 3)

    highlighted_pt = highlight_pattern(pt, pattern)
    highlighted_ct = highlight_pattern(ct, pattern)

    print("PT:", highlighted_pt)
    print("CT:", highlighted_ct)
