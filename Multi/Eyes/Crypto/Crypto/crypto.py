
import numpy as np
import matplotlib.pyplot as plt
import collections
import math
import random

# -------------------------------------------------- UTILITY

class UID:
  def __init__(self):
    self.next = 0
    self.map = { }
    self.invMap = { }

  def get_uid(self, val):
      if val not in self.map:
        self.map[val] = self.next
        self.invMap[self.next] = val
        self.next += 1
      return self.map[val]

def to_base(num,base):
    base_num = ""
    while num > 0:
        dig = int(num%base)
        if dig < 10:
            base_num += str(dig)
        else:
            base_num += chr(ord('A')+dig-10)
        num //= base
    base_num = base_num[::-1]
    return base_num

def conv_msgs_to_im(msgs):
  ml = max([ len(m) for m in msgs ])
  return [ m + [np.NaN] * (ml - len(m)) for m in msgs ]

def generate_random():
  msgs_random = []
  msgs_random_flat = []
  for i in range(9):
    msgs_random.append([ random.randint(0, 125) for _ in range(random.randint(95, 135)) ])
    msgs_random_flat.append([ np.base_repr(v, base=5).rjust(3, "0") for v in msgs_random[i] ])
  return msgs_random, msgs_random_flat

def get_blank_im(msgs):
  _, h = get_length_range(msgs)
  im = np.full((len(msgs), h), np.nan)
  return im

# -------------------------------------------------- CRYPTO CALC

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
    return sum(a == b for a,b in zip(m1, m2)), len(m1)


def check_isomorphic(msg1, msg2):
  # Extract indices from strings
  dict1 = {}
  dict2 = {}
  for i, value in enumerate(msg1): dict1[value] = dict1.get(value, []) + [i]
  for i, value in enumerate(msg2): dict2[value] = dict2.get(value, []) + [i]
  repeats = any([ len(dict1[value]) > 1 for value in dict1 ])
  isIsomorphic = repeats and sorted(dict1.values()) == sorted(dict2.values())

  # Extract pattern from indices
  uid = UID()
  isoPattern = None
  if isIsomorphic:
    isoPattern = [ uid.get_uid(str(dict1[l])) + 1 if len(dict1[l]) > 1 else np.nan for l in msg1 ]

  return isIsomorphic, isoPattern, uid.next

def check_prime(num):
  if(num <= 1):
    return False
  for i in range(2, int(math.sqrt(num)) + 1):
      if (num % i == 0):
        return False
  return True


def get_length_range(msgs):
  lengths = [ len(msg) for msg in msgs ]
  return min(lengths), max(lengths)

def get_isomorphs(msg1, msg2, usePosition=False):
  txt_len = min(len(msg1), len(msg2))
  isomorphs = []

  # Find isomporphs (without position)
  if not usePosition:
    for start1 in range(txt_len):
      for start2 in range(txt_len):
        if start1 == start2: continue
        for length in range(txt_len - start1, 0, -1):
          c1 = msg1[start1:start1+length]
          c2 = msg2[start2:start2+length]
          if c1 == c2: break
          isIsomorphic, pattern, count = check_isomorphic(c1, c2)
          if isIsomorphic:
            isomorphs.append(( start1, start1+length, pattern, count, start2, start2+length ))
            break

  # Find isomporphs (with position)
  else:
    for start in range(txt_len):
      for end in range(txt_len, start, -1):
        c1, c2 = msg1[start:end], msg2[start:end]
        if c1 == c2: break
        isIsomorphic, pattern, count = check_isomorphic(c1, c2)
        if isIsomorphic:
          isomorphs.append(( start, end, pattern, count ))
          break

  # Find largest encompassing isomorphs
  isomorphs.sort(key=lambda iso: iso[0] - iso[1])
  i1, i2 = 0, 0
  while i1 < len(isomorphs):
    i1r0 = ( isomorphs[i1][0], isomorphs[i1][1] )
    i1r1 = ( isomorphs[i1][4], isomorphs[i1][5] )
    i2 = i1 + 1
    while i2 < len(isomorphs):
      i2r = ( isomorphs[i2][0], isomorphs[i2][1] )
      i2surroundsi1 = (i2r[0] <= i1r0[1]) and (i2r[1] >= i1r0[0]) and (i2r[1] - i2r[0]) < (i1r0[1] - i1r0[0])
      if i2surroundsi1:
        isomorphs.remove(isomorphs[i2])
        i2 -= 1
      i2 += 1
    i1 += 1
  
  return isomorphs

def get_chains(t1, t2):
  if len(t1) != len(t2):
    raise "Texts must be same length."
  tlen = len(t1)
  
  # While there are pairs to process
  pairs = set([ ( t1[i], t2[i] ) for i in range(tlen) ])
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

def get_shared(msgs):
  im = get_blank_im(msgs)
  for y in range(len(msgs)):
    for x in range(len(msgs[y])):
      matching = sum([ (other[x] == msgs[y][x]) if len(other) > x else 0 for other in msgs ])
      im[y, x] = msgs[y][x] if matching > 1 else np.nan
  return im

def get_shared_unique(msgs):
  im = get_blank_im(msgs)

  for x in range(im.shape[1]):
    matches = [ ]
    for y1 in range(im.shape[0]):
      for y2 in range(y1 + 1, im.shape[0]):
        if len(msgs[y1]) <= x or len(msgs[y2]) <= x: continue
  
        if msgs[y1][x] == msgs[y2][x]:
          if msgs[y1][x] not in matches: matches.append(msgs[y1][x])
          ind = str(matches.index(msgs[y1][x]) + 1)
          im[y1][x] = ind
          im[y2][x] = ind
  
  return im

def get_gaps(msgs, limit=-1, include_end=False, replace=True):
  im = get_blank_im(msgs)
  for y in range(len(msgs)):
    msg_len = len(msgs[y])
    for i in range(msg_len):
      upper_bounds = msg_len if (limit == -1) else min(i + limit + 2, msg_len)
      for j in range(i + 1, upper_bounds):
        if msgs[y][i] == msgs[y][j]:
          gap = (j - i) if replace else msgs[y][i]
          im[y][i] = gap
          if include_end: im[y][j] = gap
          break
  return im

def get_repeats(msgs):
  im = get_blank_im(msgs)
  for y in range(len(msgs)):
    repeats = 0
    found = set()
    for x in range(len(msgs[y])):
      if msgs[y][x] in found:
        repeats += 1
      found.add(msgs[y][x])
      im[y][x] = repeats
  return im

# -------------------------------------------------- CRYPTO VISUAL

def plot_msgs(msgs, to_label=False, ascii=False):
  im = conv_msgs_to_im(msgs)
  plot_im(im, True, False)

def plot_im(im, to_label=False, ascii=False):
  plt.figure(figsize = (40,5))
  plt.imshow(im, interpolation="nearest")
  plt.axis('off')

  if to_label:
    for y in range(len(im)):
      for x in range(len(im[y])):
        if not math.isnan(im[y][x]):
          label = int(im[y][x]) if not ascii else chr(int(im[y][x]) + 32)
          plt.text(x, y, label, ha="center", va="center", fontsize="6", alpha=(0.1 if im[y][x] == 0 else 0.9))
  
  # plt.show()


def calc_plot_freq_overall(msgs):
  # ---------------------------
  # PULLED FROM ANALYSIS COLAB
  # ---------------------------
  # - Letter frequency overall
  # ---------------------------

  counts = collections.Counter()
  for msg in msgs:
    counts += collections.Counter(msg)
  countsSorted = counts.most_common()

  print("Letter Frequencies (Overall)")
  print("----------------------------")
  print(f"5 most common letters: { countsSorted[:5] }")
  print(f"5 least common letters: { countsSorted[-5:] }")
  print(f"Median frequency: {np.median(list(counts.values()))}")
  print(f"Mean frequency: {np.mean(list(counts.values()))}")
  print("")

  x = range(max(counts) * 2)
  y = [counts[a] for a in x]
  ax1, ax2 = plt.figure(0, (18, 4)).subplots(1, 2)
  ax1.bar(x, y)
  ax1.set(xlabel="Cipher Letter", ylabel="Count")
  ax2.bar(x, sorted(y, reverse=True))
  ax2.set(xlabel="Cipher Letter", ylabel="Count")
  plt.show()

def calc_plot_freq_individual(msgs):
  # ---------------------------
  # PULLED FROM ANALYSIS COLAB
  # ---------------------------
  # - Letter frequency per message
  # ---------------------------

  m = max([ max(msg) for msg in msgs ]) + 1
  im = np.zeros((len(msgs), m), 'i4')
  for y, msg in enumerate(msgs):
    for let in msg:
      im[y, let] += 1

  print("Letter Frequencies (Per message)")
  print("--------------------------------")
  ax = plt.figure(0, (16, 4)).subplots()
  ax.set(xlabel="Cipher Letter", ylabel="Message")
  ax.imshow(im)
  plt.show()

def calc_plot_kappa_auto(msgs):
  # ---------------------------
  # PULLED FROM ANALYSIS COLAB
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
  ax.set(xlabel="Offset", ylabel="Count")
  ax.legend()
  plt.show()

def calc_plot_kappa_periodic(msgs):
  # ---------------------------
  # PULLED FROM ANALYSIS COLAB
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
  ax.bar(x, results_y, 0.8, label="Coincidences per 1000")
  ax.plot(bounds, (66, 66), 'g', label="Expected (English)")
  ax.plot(bounds, (12, 12), 'r', label="Expected (Random)")
  ax.set(xlabel="Period Length", ylabel="Count")
  ax.legend()
  plt.show()
