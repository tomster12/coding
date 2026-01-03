from typing import List
import numpy as np


class UID:
    def __init__(self):
        self.next = 0
        self.map = {}
        self.invMap = {}

    def get(self, val):
        if val not in self.map:
            self.map[val] = self.next
            self.next += 1
            self.invMap[self.next] = val
        return self.map[val]


def encode_caeser(pt: str, pt_alphabet: str, shift=3) -> str:
    ct = ""
    N = len(pt_alphabet)
    for p in pt:
        if p not in pt_alphabet:
            ct += p
            continue
        p_i = pt_alphabet.index(p)
        ct += pt_alphabet[(p_i + shift) % N]
    return ct


def text_difference(t1: str, t2: str, alphabet: str) -> List[str]:
    N = len(alphabet)
    diff = ''
    for a, b in zip(t1, t2):
        if a not in alphabet or b not in alphabet:
            diff += b
            continue
        a_i = alphabet.index(a)
        b_i = alphabet.index(b)
        diff_i = (b_i - a_i) % N
        diff += alphabet[diff_i]
    return diff


def text_difference_numeric(t1: str, t2: str, alphabet: str) -> List[int]:
    N = len(alphabet)
    diff = []
    for a, b in zip(t1, t2):
        if a not in alphabet or b not in alphabet:
            diff.append(-1)
            continue
        a_i = alphabet.index(a)
        b_i = alphabet.index(b)
        diff_i = (b_i - a_i) % N
        diff.append(diff_i)
    return diff


def calculate_pattern(text: str) -> List[int]:
    instances = {}
    values = {}
    next_value = 0
    for c in text:
        if c not in instances:
            instances[c] = []
        instances[c].append(c)
        if len(instances[c]) == 2:
            values[c] = next_value
            next_value += 1

    pattern = []
    for c in text:
        if c in values:
            pattern.append(values[c])
        else:
            pattern.append(None)
    return pattern


def calculate_isomorph(t1: str, t2: str) -> List[int]:
    texts = [t1, t2]

    # Calculate the indices of each letter in each text
    letter_repeats = [{} for _ in range(len(texts))]
    for msg_i in range(len(texts)):
        for letter_i, letter in enumerate(texts[msg_i]):
            if letter not in letter_repeats[msg_i]:
                letter_repeats[msg_i][letter] = []
            letter_repeats[msg_i][letter].append(letter_i)

    # Isomorphic if any letter is repeated and the repeats match
    has_repeats = any(
        [len(letter_repeats[0][letter]) > 1 for letter in letter_repeats[0]])
    sorted_repeats = [sorted(d.values()) for d in letter_repeats]
    all_sorted_are_equal = all(
        [sorted_repeats[0] == sorted_repeats[i] for i in range(1, len(sorted_repeats))])

    if not has_repeats or not all_sorted_are_equal:
        return None

    # Extract pattern from the repeat pattern
    uid = UID()
    pattern = [uid.get(
        str(letter_repeats[0][l])) + 1
        if len(letter_repeats[0][l]) > 1
        else np.nan for l in texts[0]]

    return pattern


def calculate_chains(t1: str, t2: str) -> List[List[str]]:
    # While there are pairs left, pkeep chaining them together
    pairs = set([(t1[i], t2[i]) for i in range(len(t1))])
    chains = []
    while len(pairs) > 0:
        current_chain = list(pairs.pop())
        continue_chaining = True
        while continue_chaining:
            continue_chaining = False
            for pair in pairs.copy():

                # Try attach pair onto start or end of chain
                if current_chain[-1] == pair[0]:
                    current_chain.append(pair[1])
                    pairs.remove(pair)
                    continue_chaining = True
                elif pair[1] == current_chain[0]:
                    current_chain.insert(0, pair[0])
                    pairs.remove(pair)
                    continue_chaining = True
        chains.append("".join(current_chain))
    return chains


def highlight_pattern(text: str, pattern: List[int]) -> str:
    highlighted = ""
    for c, p in zip(text, pattern):
        if p is None:
            highlighted += c
        else:
            # Cycle through colors for the background
            color_code = 41 + (p % 6)
            highlighted += f"\033[{color_code}m{c}\033[0m"
    return highlighted
