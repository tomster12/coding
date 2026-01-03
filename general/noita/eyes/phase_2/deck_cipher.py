# Heavily based on Lymm's deck cipher implementation in deck_cipher_lymm.py

from typing import List, Tuple, Dict, NamedTuple
import numpy as np
import random


class Permutations(NamedTuple):
    rotations: List[np.ndarray]
    decimations: List[np.ndarray]
    swaps: List[np.ndarray]


def generate_permutations(ct_alphabet_size) -> Permutations:
    rotations = []
    for k in range(ct_alphabet_size):
        p = [(i+k) % ct_alphabet_size for i in range(ct_alphabet_size)]
        rotations.append(np.array(p))

    decimations = []
    for k in range(ct_alphabet_size):
        p = [(i*k) % ct_alphabet_size for i in range(ct_alphabet_size)]
        decimations.append(np.array(p))

    swaps = []
    for k in range(ct_alphabet_size):
        p = [i for i in range(ct_alphabet_size)]
        p[0], p[k] = p[k], p[0]
        swaps.append(np.array(p))

    return Permutations(rotations, decimations, swaps)


def compose_permutations(p1: np.ndarray, p2: np.ndarray) -> np.ndarray:
    # Numpy array-based permutation composition
    return p2[p1]


def encrypt(pt: str, initial_state: np.ndarray, pt_alphabet: str, ct_alphabet: str, pt_mapping: Dict[str, np.ndarray]) -> str:
    if initial_state is None:
        # Use the identity state
        state = np.array([i for i in range(83)])
    else:
        state = initial_state

    # Encrypt the plaintext by composing permutations
    ct = ""
    for p in pt:
        if p not in pt_alphabet:
            ct += p
            continue
        perm = pt_mapping[p]
        state = compose_permutations(perm, state)
        ct_index = state[0]
        ct += ct_alphabet[ct_index]

    return ct


def generate_random_pt_mapping(base_permutation: np.ndarray, num_swaps: int, pt_alphabet: str, swaps: List[np.ndarray]) -> Tuple[Dict[str, np.ndarray], Dict[str, List[int]]]:
    swap_indices = list(range(len(swaps)))
    pt_mapping = {}
    pt_swaps = {}

    used = set()
    for p in pt_alphabet:
        attempts = 0
        while True:
            attempts += 1

            # Select and compose a series of random swaps
            current_swaps = []
            perm = base_permutation
            for _ in range(num_swaps):
                swap_index = random.choice(swap_indices)
                perm = compose_permutations(swaps[swap_index], perm)
                current_swaps.append(swap_index)

            # Assign permutation if it avoids doubles and ensures reversibility
            target = perm[0]
            if target != 0 and target not in used:
                used.add(target)
                pt_mapping[p] = perm
                pt_swaps[p] = current_swaps
                break

            if attempts > 1000:
                raise Exception(
                    "Failed to make reversible mapping. Try different settings or alphabets.")

    return pt_mapping, pt_swaps


if __name__ == "__main__":
    # Plaintext of size 36, ciphertext of size 83
    pt_alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    ct_alphabet = ''.join([chr(33 + i) for i in range(83)])

    # Generate some plaintext permutations using some arbitrary settings
    permutations = generate_permutations(len(ct_alphabet))

    shift = 26
    decimation = 3
    base_permutation = compose_permutations(
        permutations.rotations[shift], permutations.decimations[decimation])

    num_swaps = 3
    random.seed(83)
    pt_mapping, pt_swaps = generate_random_pt_mapping(
        base_permutation, num_swaps, pt_alphabet, permutations.swaps)

    # Example usage to encrypt a message
    print(encrypt("DECKCIPHER\n"*3, None, pt_alphabet, ct_alphabet, pt_mapping))
