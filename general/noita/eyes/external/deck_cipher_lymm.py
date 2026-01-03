# Simple deck cipher implementation
from typing import List, Tuple, Dict
import numpy as np
import random


def compose(p1: np.ndarray, p2: np.ndarray) -> np.ndarray:
    # Composition of permutations, made very simple with numpy
    return p2[p1]


# Simple permutations which can be composed to build up actions on the deck
rotations = []
for k in range(83):
    p = [(i+k) % 83 for i in range(83)]
    rotations.append(np.array(p))

decimations = []
for k in range(83):
    p = [(i*k) % 83 for i in range(83)]
    decimations.append(np.array(p))

# Note this is just swaps with the top card, since those have the largest effect, but other swaps are also valid
# Also note the first one here is the identity
swaps = []
for k in range(83):
    p = [i for i in range(83)]
    p[0], p[k] = p[k], p[0]
    swaps.append(np.array(p))


def encrypt(pt: str, initial_state: np.ndarray = None) -> str:
    """
    Encrypt a message using a deck cipher. Cipher settings are input via globals. There are some restrictions on the settings for the cipher to be reversible and avoid doubles.

    Args:
        pt (str): Plaintext message to encrypt
        initial_state (np.ndarray): Initial deck order, default is standard sorted order (identity permutation)

    Globals for cipher settings:
        pt_alphabet (str): Plaintext alphabet, of any size and any symbols. Order doesn't matter.
        ct_alphabet (str): Ciphertext alphabet, equal to the size of the deck, again any symbols and any order. Order determines the default deck order.
        pt_mapping (dict[str, np.ndarray]): Mapping between plaintext alphabet symbols and permutations (as 1D numpy arrays), giving the action/shuffle/permutation applied to the deck for each letter.

    Returns:
        str: Encrypted message, in the ciphertext alphabet.
    """
    global pt_alphabet, ct_alphabet, pt_mapping
    if initial_state is None:
        state = np.array([i for i in range(83)])  # Identity state
    else:
        state = initial_state
    ct = ''
    for p in pt:
        if p not in pt_alphabet:
            ct += p
            continue
        perm = pt_mapping[p]
        # Left multiplication, right multiplication is also valid (equivalent to multiplication by inverse)
        state = compose(perm, state)
        ct_index = state[0]
        ct += ct_alphabet[ct_index]
    return ct


def generate_random_pt_mapping(base_permutation: np.ndarray, num_swaps: int) -> Tuple[Dict[str, np.ndarray], Dict[str, List[int]]]:
    """
    Generate a random mapping between plaintext alphabet symbols and permutations, by applying some number of swaps to some base permutation. 
    Ensures reversibility and no doubles. Raises exception if it fails to ensure reversibility.
    This does not produce all possible plaintext mappings, just ones starting from the same base permutation.

    Args:
        base_permutation (np.ndarray): The permutation to apply the swaps to.
        num_swaps (int): Number of swaps to apply to each plaintext alphabet letter

    Globals:
        pt_alphabet (str): Plaintext alphabet, with any number of symbols. Note that the cipher will fail to be reversible if this is larger than the deck size.
        swaps (list[np.ndarray]): List of swap permutations which can be applied

    Returns:
        tuple[dict[str, np.ndarray], dict[str, list[int]]]: Two dictionaries containing the pt_mapping and a more readable list of swaps which were applied for each symbol.
    """
    global pt_alphabet, swaps
    swap_indices = list(range(len(swaps)))
    pt_mapping = {}
    # This is only for readability really, a list of swaps for each plaintext letter, instead of the entire permutation
    pt_swaps = {}
    used = set()
    for letter in pt_alphabet:
        attempts = 0
        while True:
            attempts += 1
            current_swaps = []
            perm = base_permutation
            for _ in range(num_swaps):
                swap_index = random.choice(swap_indices)
                perm = compose(swaps[swap_index], perm)
                current_swaps.append(swap_index)
            target = perm[0]
            # Avoid doubles and ensure reversibility
            if target != 0 and target not in used:
                used.add(target)
                pt_mapping[letter] = perm
                pt_swaps[letter] = current_swaps
                break
            if attempts > 1000:
                # Give up, settings were probably bad and it's not reversible
                raise Exception(
                    "Failed to make reversible mapping. Try using a smaller plaintext alphabet.")
    return pt_mapping, pt_swaps


# Plaintext alphabet can be any size and use any characters you want,
# though the cipher cannot be reversible if it's larger than the deck size,
# and cannot avoid doubles if it's equal to the deck size.
# Example PT alphabets (symbols are pretty arbitrary)
# pt_alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' # 26
pt_alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'  # 36

# Ciphertext alphabet is also the size of the deck, here 83
# Currently using ASCII+33 for display of the CT output, can use ASCII+32 instead or whatever you want
ct_alphabet = ''.join([chr(33+i) for i in range(83)])

# Define a base permutation for the PT mapping generator, I'm using one with constant shift+decimation
# This should work fine with any settings mod 83, but obviously decimation can't be 0
shift = 26
decimation = 3
base_permutation = compose(rotations[shift], decimations[decimation])

random.seed(83)
num_swaps = 3
pt_mapping, pt_swaps = generate_random_pt_mapping(base_permutation, num_swaps)

# Example usage to encrypt a message
print(encrypt("DECKCIPHER\n"*3))
