
from queue import Queue
from .util import *
import numpy as np
import matplotlib.pyplot as plt
import matplotlib as mpl
import collections
import math
import itertools
import time


# -------- Calculation --------


def calc_IoC(msg, alphabetCount):
    # Calculate IoC of the message
    N = len(msg)
    freqs = collections.Counter(msg)
    alphabet = range(alphabetCount)
    freqsum = 0.0
    for l in alphabet:
        freqsum += freqs[l] * (freqs[l] - 1)
    return freqsum / ((N * (N - 1)) / alphabetCount)


def calc_kappa_test(msg1, msg2, offset):
    """
    Kappa test for rate of coincidence between distinct ciphertexts.
    Test the two ciphertexts and return an (N, D) tuple, where:
                    N is the number of coincidences
                    D is the number of tests performed
    """
    m1 = msg1[offset:]
    m2 = msg2[:len(m1)]
    m1 = m1[:len(m2)]
    return sum(a == b for a, b in zip(m1, m2)), len(m1)


def calc_length_range(msgs):
    lengths = [len(msg) for msg in msgs]
    return min(lengths), max(lengths)


def calc_if_isomorphic(msgs):
    # Funky sorted index list method
    dicts = [{} for msg in msgs]
    i_range = range(len(msgs))
    for i in i_range:
        for o, value in enumerate(msgs[i]):
            dicts[i][value] = dicts[i].get(value, []) + [o]
    repeats = any([len(dicts[0][value]) > 1 for value in dicts[0]])
    sorted_vals = [sorted(d.values()) for d in dicts]
    is_isomorphic = repeats and (sorted_vals.count(
        sorted_vals[0]) == len(sorted_vals))

    # Extract pattern from indices
    uid = UID()
    iso_pattern = None
    if is_isomorphic:
        iso_pattern = [uid.get_uid(
            str(dicts[0][l])) + 1 if len(dicts[0][l]) > 1 else np.nan for l in msgs[0]]
    return is_isomorphic, iso_pattern, uid.next


def calc_isomorphs(msgs, to_print=False, allow_equal=True):
    if len(msgs) < 2:
        return
    time_start = time.time()
    isomorphs = []
    i_range = range(len(msgs))
    lengths = [len(m) for m in msgs]
    ranges = [range(l) for l in lengths]
    max_length = [[(lengths[i] - o) for o in ranges[i]] for i in i_range]

    # Work backwards for all possible lengths
    max_iso_length = min(lengths) - 1
    for length in range(max_iso_length, 0, -1):
        if to_print:
            print(f"Checking length {length}")

        # Find starts for all but add (msgs0,msgs1) first
        all_starts = [range(lengths[i] - length) for i in i_range]
        to_check = Queue()
        for pair in itertools.product(all_starts[0], all_starts[1]):
            to_check.put([pair[0], pair[1]])

        # Grab current pair
        while not to_check.empty():
            current = to_check.get()

            # Make sure this option doesnt overlap any existing
            if any([length > max_length[i][current[i]] for i in range(len(current))]):
                continue

            # Check if texts covered are isomorphic (and unequal if needed)
            texts = [msgs[i][current[i]:current[i]+length]
                     for i in range(len(current))]
            if not allow_equal and texts.count(texts[0]) == len(texts):
                continue
            isIsomorphic, pattern, count = calc_if_isomorphic(texts)
            if isIsomorphic:

                # Pair covers all messages so isomorph and update max lengths
                if len(current) == len(msgs):
                    matching_ranges = [[s, s+length] for s in current]
                    isomorphs.append((pattern, count, matching_ranges))
                    if to_print:
                        print(f"Isomorph: {isomorphs[-1]}")
                    for i in i_range:
                        for o in range(max(current[i]-length+1, 0), current[i]+length):
                            max_length[i][o] = max(current[i] - o, 0)

                # Pair only covers some so populate queue
                else:
                    for s in all_starts[len(current)]:
                        to_check.put([*current, s])

    time_end = time.time()
    if to_print:
        print(f"Time taken: {time_end - time_start}")
    return isomorphs


def calc_chains(t1, t2):
    if len(t1) != len(t2):
        raise "Texts must be same length."
    tlen = len(t1)

    # While there are pairs to process
    pairs = set([(t1[i], t2[i]) for i in range(tlen)])
    chains = []
    while len(pairs) > 0:
        current = list(pairs.pop())

        # Process sequence until finished
        toLoop = True
        while toLoop:
            toLoop = False

            for pair in pairs.copy():
                if pair[0] == current[-1]:
                    current.append(pair[1])
                    pairs.remove(pair)
                    toLoop = True

                elif pair[1] == current[0]:
                    current.insert(0, pair[0])
                    pairs.remove(pair)
                    toLoop = True

        chains.append("".join(current))
    return chains


def calc_shared(msgs, zero_value=np.nan):
    im = generate_blank_im(msgs)
    for y in range(len(msgs)):
        for x in range(len(msgs[y])):
            matching = sum([
                1 if ((len(other) > x) and (other[x] == msgs[y][x]))
                else 0 for other in msgs])
            im[y, x] = msgs[y][x] if matching > 1 else zero_value
    return im


def calc_shared_unique(msgs):
    im = generate_blank_im(msgs)

    for x in range(im.shape[1]):
        matches = []
        for y1 in range(im.shape[0]):
            for y2 in range(y1 + 1, im.shape[0]):
                if len(msgs[y1]) <= x or len(msgs[y2]) <= x:
                    continue

                if msgs[y1][x] == msgs[y2][x]:
                    if msgs[y1][x] not in matches:
                        matches.append(msgs[y1][x])
                    ind = str(matches.index(msgs[y1][x]) + 1)
                    im[y1][x] = ind
                    im[y2][x] = ind

    return im


def calc_gaps(msgs, limit=None, include_end=False, use_msg_value=False, zero_value=np.nan):
    im = generate_blank_im(msgs, blank=np.nan)

    for y in range(len(msgs)):
        msg_len = len(msgs[y])

        for x1 in range(msg_len):
            if np.isnan(im[y][x1]) and not np.isnan(zero_value):
                im[y][x1] = zero_value

            upper_bounds = msg_len if (limit is None) else min(
                (x1 + 1) + limit + 1, msg_len)

            for x2 in range(x1 + 1, upper_bounds):
                if msgs[y][x1] == msgs[y][x2]:
                    im[y][x1] = msgs[y][x1] if use_msg_value else (x2 - x1)
                    if include_end:
                        im[y][x2] = im[y][x1]
                    break

    return im


def conv_isomorphs_to_img(msgs, isos, zero_value=0, use_pattern_value=False):
    im = generate_blank_im(msgs, -1 if use_pattern_value else zero_value)
    count = 1
    for iso in isos:
        for ri in range(len(iso[2])):
            r = range(iso[2][ri][0], iso[2][ri][1])
            for i in range(len(iso[0])):
                v = count if not use_pattern_value else (
                    0 if np.isnan(iso[0][i]) else iso[0][i])
                im[ri][r[i]] = v
        count += 1
    return im


def calc_repeats(msgs):
    im = generate_blank_im(msgs)
    for y in range(len(msgs)):
        repeats = 0
        found = set()
        for x in range(len(msgs[y])):
            if msgs[y][x] in found:
                repeats += 1
            found.add(msgs[y][x])
            im[y][x] = repeats
    return im


def calc_if_prime(num):
    if (num <= 1):
        return False
    for i in range(2, int(math.sqrt(num)) + 1):
        if (num % i == 0):
            return False
    return True


# -------- Visual --------


def conv_msgs_to_im(msgs):
    ml = max([len(m) for m in msgs])
    return [m + [np.nan] * (ml - len(m)) for m in msgs]


def generate_blank_im(msgs, blank=np.nan):
    _, ml = calc_length_range(msgs)
    im = np.full((len(msgs), ml), blank)
    return im


def plot_im(im, ascii=False, title=None, labels=None, to_dull=False, cmap_name="distinct", under_color="#d9d9d9", dull_amount=0.1, under_value=0, cast_labels=True, figsize=(40, 5)):
    plt.figure(figsize=figsize)

    if cmap_name == "distinct":
        np.random.seed(0)
        max_val = int(
            max([max([x for x in r if not np.isnan(x)]) for r in im]))
        cols = np.random.rand(max_val, 3) * 0.5 + 0.5
        cmap = mpl.colors.ListedColormap(cols)
    else:
        cmap = mpl.cm.get_cmap(cmap_name).copy()
    cmap.set_under(color=under_color)

    plt.imshow(im, interpolation="nearest", cmap=cmap, vmin=under_value)
    plt.subplots_adjust(left=0.1, right=0.9, top=0.9, bottom=0.1)
    plt.axis('off')

    if title is not None:
        plt.title(title)

    labels = labels if (labels is not None) else im

    if labels is not None:
        for y in range(len(labels)):
            for x in range(len(labels[y])):
                if not cast_labels or not math.isnan(labels[y][x]):
                    label = labels[y][x] if not cast_labels else int(
                        labels[y][x]) if not ascii else chr(int(labels[y][x]) + 32)
                    plt.text(x, y, label, ha="center", va="center", fontsize="7", alpha=(
                        dull_amount if im[y][x] < under_value and to_dull else 0.9))


def plot_msgs(msgs, to_label=False, ascii=False, title=None):
    im = conv_msgs_to_im(msgs)
    plot_im(im, ascii=True, title=title)


def plot_msgs_freq_overall(msgs):
    # ---------------------------
    # PULLED FROM analysis COLAB
    # ---------------------------
    # - Letter frequency overall
    # ---------------------------

    counts = collections.Counter()
    for msg in msgs:
        counts += collections.Counter(msg)
    countsSorted = counts.most_common()

    print("Letter Frequencies (Overall)")
    print("----------------------------")
    print(f"5 most common letters: {countsSorted[:5]}")
    print(f"5 least common letters: {countsSorted[-5:]}")
    print(f"Median frequency: {np.median(list(counts.values()))}")
    print(f"Mean frequency: {np.mean(list(counts.values()))}")
    print("")

    x = range(max(counts) + 1)
    y = [counts[a] for a in x]
    ax1, ax2 = plt.figure(0, (18, 4)).subplots(1, 2)
    ax1.set_title("Letter Frequencies (Overall)")
    ax2.set_title("Letter Frequencies Sorted (Overall)")
    ax1.bar(x, y)
    ax1.set(xlabel="Cipher Letter", ylabel="Count")
    ax2.bar(x, sorted(y, reverse=True))
    ax2.set(ylabel="Count")
    ax1.set_xticks(range(0, max(counts) + 1, 5))
    ax2.set_xticks([])
    plt.show()


def plot_msgs_freq_individual(msgs):
    # ---------------------------
    # PULLED FROM analysis COLAB
    # ---------------------------
    # - Letter frequency per message
    # ---------------------------

    m = max([max(msg) for msg in msgs]) + 1
    im = np.zeros((len(msgs), m), 'i4')
    for y, msg in enumerate(msgs):
        for let in msg:
            im[y, let] += 1

    print("Letter Frequencies (Per message)")
    print("--------------------------------")
    ax = plt.figure(0, (16, 4)).subplots()
    plt.title("Letter Frequencies (Individual)")
    ax.set(xlabel="Cipher Letter", ylabel="Message")
    ax.imshow(im)
    plt.show()


def plot_msgs_kappa_auto(msgs):
    # ---------------------------
    # PULLED FROM analysis COLAB
    # ---------------------------
    # - Kappa test (Autocorrelation)
    # ---------------------------

    bounds = (1, 40)
    x = list(range(*bounds))
    results_y = []
    for w in x:
        matches = 0
        checks = 0
        for i in range(len(msgs)):
            match, check = calc_kappa_test(msgs[i], msgs[i], w)
            matches += match
            checks += check

        results_y.append(1000 * matches / checks)

    print("Kappa Auto-Correlation Test")
    print("---------------------------")
    ax = plt.figure(0, (12, 4)).subplots()
    ax.bar(x, results_y, 0.8, label="Coincidences per 1000")
    ax.plot(bounds, (66, 66), 'g', label="Expected (English)")
    ax.plot(bounds, (12, 12), 'r', label="Expected (Random)")
    plt.title("Kappa Auto-Correlation Test")
    ax.set(xlabel="Offset", ylabel="Count")
    ax.legend()
    plt.show()


def plot_msgs_kappa_periodic(msgs):
    # ---------------------------
    # PULLED FROM analysis COLAB
    # ---------------------------
    # - Kappa test (Periodic)
    # ---------------------------

    bounds = (4, 90)
    x = list(range(*bounds))
    results_y = []
    for offset in x:
        matches = 0
        checks = 0
        for msg1 in msgs:
            for msg2 in msgs:
                mtch, check = calc_kappa_test(msg1, msg2, offset)
                matches += mtch
                checks += check

        results_y.append(1000 * matches / checks)

    print("Kappa Periodic Test")
    print("-------------------")
    ax = plt.figure(0, (12, 4)).subplots()
    plt.title("Kappa Periodic Test")
    ax.bar(x, results_y, 0.8, label="Coincidences per 1000")
    ax.plot(bounds, (66, 66), 'g', label="Expected (English)")
    ax.plot(bounds, (12, 12), 'r', label="Expected (Random)")
    ax.set(xlabel="Period Length", ylabel="Count")
    ax.legend()
    plt.show()


def plot_gap_freq(msgs):
    msgs_gaps = calc_gaps(msgs, use_msg_value=False)
    counter = collections.Counter()
    for msg_gaps in msgs_gaps:
        m = [int(x) for x in filter(lambda x: not np.isnan(x), msg_gaps)]
        counter += collections.Counter(m)
    x = range(1, 31)
    for i in x:
        print(f"{i}: {counter[i]}")
    y = [counter[a] for a in x]
    plt.bar(x, y)
    plt.show()


def print_msgs_ascii(messages, offset=32):
    print("Ascii of message (1 - " + str(len(messages)) + ")")
    print("-------------------------")
    print("Note: This will break for messages with values > 95\n")
    for msg in messages:
        print("".join([chr(v + offset) for v in msg]))


def print_msgs_IoC(messages, alphabetCount=None):
    alphabetCT = set()
    if alphabetCount == None:
        for msg in messages:
            alphabetCT = alphabetCT.union(set(msg))
    alphabetCount = len(alphabetCT)

    print("IoC Oveview")
    print("-----------")
    print("Letters (" + str(alphabetCount) + "): " + str(alphabetCT))

    full = []
    print("\nIOC of each:")
    for i, msg in enumerate(messages):
        print(str(i + 1) + ": " + str(calc_IoC(msg, alphabetCount)))
        full += msg
    print("all: " + str(calc_IoC(full, alphabetCount)))


def full_overview(msgs):
    print("Overview")
    print("---------")
    print(f"Messages: {len(msgs)}")
    print(f"Message lengths: {[len(msg) for msg in msgs]}\n")
    print_msgs_ascii(msgs)
    print("")
    plot_msgs(msgs, title="Messages")
    print_msgs_IoC(msgs)
    print("")
    plot_msgs_freq_overall(msgs)
    plot_msgs_freq_individual(msgs)
