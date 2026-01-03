import itertools
from typing import List
from shared import calculate_isomorph, calculate_chains, highlight_pattern


def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a


def perform_alphabet_chaining(texts: List[str]) -> str:
    all_letters = set()
    for t in texts:
        all_letters.update(set(t))

    # First calculate chain sets between each pair of texts
    text_pair_indices = list(itertools.combinations(range(len(texts)), 2))
    text_pair_chain_sets = {}
    for (t1_index, t2_index) in text_pair_indices:
        chains = calculate_chains(texts[t1_index], texts[t2_index])
        text_pair_chain_sets[(t1_index, t2_index)] = chains

    # Try alphabet chain between each pair of chain sets
    chain_set_pair_indices = list(itertools.combinations(range(len(text_pair_indices)), 2))
    for chain_set_pair in chain_set_pair_indices:
        t1_index, t2_index = text_pair_indices[chain_set_pair[0]]
        t3_index, t4_index = text_pair_indices[chain_set_pair[1]]
        t12_chain_set = text_pair_chain_sets[(t1_index, t2_index)]
        t34_chain_set = text_pair_chain_sets[(t3_index, t4_index)]

        print("------- New Chain Set Pair --------------\n")
        print(f"Chaining pair of chain sets (T{t1_index+1}-T{t2_index+1}) and (T{t3_index+1}-T{t4_index+1}):")
        print(f"\t(T{t1_index+1}-T{t2_index+1}) Chains:", t12_chain_set)
        print(f"\t(T{t3_index+1}-T{t4_index+1}) Chains:", t34_chain_set)

        # For each pair of chains in the sets find those with 2+ common letters
        for t12_chain in t12_chain_set:
            for t34_chain in t34_chain_set:
                common_letters = list(set(t12_chain) & set(t34_chain))
                if len(common_letters) < 2:
                    break
                    
                # Find the scaling factor for each chain that aligns the common letters
                l1, l2 = common_letters[:2]
                c1_l1_index = t12_chain.index(l1)
                c1_l2_index = t12_chain.index(l2)
                c2_l1_index = t34_chain.index(l1)
                c2_l2_index = t34_chain.index(l2)
                c1_letters_dist = abs(c1_l2_index - c1_l1_index)
                c2_letters_dist = abs(c2_l2_index - c2_l1_index)
                dist_gcd = gcd(c1_letters_dist, c2_letters_dist)
                c1_scale = c2_letters_dist // dist_gcd
                c2_scale = c1_letters_dist // dist_gcd

                print("Chosen chains with common letters " + str(common_letters) + ":")
                print("\tChain 1: '" + t12_chain + "'")
                print("\tChain 2: '" + t34_chain + "'")

                def scale_chain(chain: str, scale: int) -> list[str]:
                    scaled_length = (len(chain) - 1) * scale + 1
                    scaled_chain = [None] * scaled_length
                    for i, letter in enumerate(chain):
                        scaled_index = i * scale
                        scaled_chain[scaled_index] = letter
                    return scaled_chain

                def stringify_chain(chain: list[str]) -> str:
                    return ''.join([c if c is not None else '.' for c in chain])

                # Try overlap each scaled chain onto a shared alphabet
                t12_chain_set_scaled = [scale_chain(c, c1_scale) for c in t12_chain_set]
                t34_chain_set_scaled = [scale_chain(c, c2_scale) for c in t34_chain_set]
                print(f"Calculated scales {c1_scale}, {c2_scale} to align chains:")
                print("\tChain 1:", list(stringify_chain(c) for c in t12_chain_set_scaled))
                print("\tChain 2:", list(stringify_chain(c) for c in t34_chain_set_scaled))

                print("\nStarting alphabet chaining...\n" + "-"*40)
                remaining_chains = [(c, 0) for c in (t12_chain_set_scaled + t34_chain_set_scaled)]
                alphabet = None
                chain_set_pair_failed = False
                while len(remaining_chains) > 0 and not chain_set_pair_failed:
                    chain, attempts = remaining_chains.pop(0)

                    # If we have tried a chain too many times, skip this chain
                    if attempts > 10:
                        print("Chain has been skipped too many times:", stringify_chain(chain))
                        continue

                    # If we don't have an alphabet yet, use this chain to create one
                    if alphabet is None:
                        alphabet = [None for i in range(len(all_letters))]
                        for index, letter in enumerate(chain):
                            if letter is not None:
                                alphabet = alphabet[:index] + [letter] + alphabet[index+1:]
                        print(f"Initialise alphabet from chain [{stringify_chain(alphabet)}] with length {len(all_letters)}")

                        continue

                    # Try each letter in the chain as the fixed letter on the alphabet
                    placed_chain = False
                    chain_has_conflicts = False
                    for fix_chain_index, fix_letter in enumerate(chain):
                        if fix_letter is None or fix_letter not in alphabet:
                            continue

                        # Align the chain in the alphabet with the fixed letter
                        fix_alphabet_index = alphabet.index(fix_letter)
                        alphabet_start = fix_alphabet_index - fix_chain_index

                        # Check for conflicts of each aligned letter
                        current_fix_letter_causes_conflict = False
                        for i, letter in enumerate(chain):
                            if letter is not None:
                                target_index = (alphabet_start + i) % len(alphabet)
                                if alphabet[target_index] != None and alphabet[target_index] != letter:
                                    print(f"Conflict placing chain '{stringify_chain(chain)}' at index {alphabet_start}, {alphabet[target_index]} != {letter}")
                                    current_fix_letter_causes_conflict = True
                                    break
                        if current_fix_letter_causes_conflict:
                            chain_has_conflicts = True
                            continue

                        # Place the chain onto the alphabet
                        placed_chain = True
                        print("Placing chain '" + stringify_chain(chain) + "' at index", alphabet_start)
                        for i, letter in enumerate(chain):
                            if letter is not None:
                                target_index = (i + alphabet_start) % len(alphabet)
                                alphabet = alphabet[:target_index] + [letter] + alphabet[target_index+1:]
                        print(f"\t[{stringify_chain(alphabet)}]")
                        break
                
                    if not placed_chain:
                        # If we cannot place a chain at all on the alphabet then give up on this pair of chain sets
                        if chain_has_conflicts:
                            print(f"Could not place chain {stringify_chain(chain)}, failing chain set pair...")
                            chain_set_pair_failed = True
                            break

                        # Otherwise queue it back up
                        else:
                            remaining_chains.append((chain, attempts + 1))

                if chain_set_pair_failed:
                    print("-"*40 + f"\nCould not alphabet chain successfully\n")

                else:
                    print("-"*40)
                    print("Chained succesfully:", stringify_chain(alphabet) + "\n")
                    return alphabet


if __name__ == "__main__":
    alphabet = ''.join([chr(33 + i) for i in range(83)])

    isomorphs = [
        "USLLMMBEEFQWECSZTGAOMPGCATEUSEILFVKWJSAXGZS",
        "XVAAWWNRRTLCRSVHJUPZWEUSPJRXVRYATBFCOVPDUHV",
        "JGWWHHXVVQMIVYGELTCPHSTYCLVJGVKWQUNIAGCOTEG"
    ]

    print("------------------------- Isomorph Pair Chains -------------------------\n")
    isomorph_pairs = list(itertools.combinations(range(len(isomorphs)), 2))
    for pair in isomorph_pairs:
        t1 = isomorphs[pair[0]]
        t2 = isomorphs[pair[1]]
        isomorph = calculate_isomorph(t1, t2)
        chains = calculate_chains(t1, t2)
        print(f"T{pair[0]+1}:", highlight_pattern(t1, isomorph))
        print(f"T{pair[1]+1}:", highlight_pattern(t2, isomorph))
        print(f"T{pair[0]+1}-T{pair[1]+1} Chains:", chains)
        print()

    print("------------------------- Alphabet Chaining -------------------------\n")
    alphabet = perform_alphabet_chaining(isomorphs)
