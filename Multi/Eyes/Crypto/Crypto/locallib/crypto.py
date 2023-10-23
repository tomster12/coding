
import textwrap
import math
import random

# -------- General --------

def simulate_annealing(init_temp, k_max, it_max, bestRetention, f_init, f_nudge, f_fitness):
    best_state = f_init()
    best_state_fitness = f_fitness(best_state)
    best_states = [ ( best_state_fitness, best_state ) ]

    for k in range(k_max):
        T = init_temp * (1 - k / k_max)

        for it in range(it_max):
            candidate = f_nudge(best_state)
            candidate_fitness = f_fitness(candidate)
            df = candidate_fitness - best_state_fitness

            if (df > 0) or (df < 0 and random.random() < math.pow(math.e, df / T)):
                best_state = candidate
                best_state_fitness = candidate_fitness
                best_states.append(( best_state_fitness, best_state ))
                if len(best_states) > bestRetention: best_states.pop(0)

    for state in best_states: print(state)
    print(f"\nFinal Fitness: {best_state_fitness}")
    return best_state, best_states

class EnglishChecker:
    def __init__(self):
        self.quadgram_data = { }
        self.quadgram_data_total = 0

        with open("data/quadgrams.txt") as f:
            lines = f.read().splitlines()
            for line in lines:
                s = line.split(" ")
                self.quadgram_data[s[0]] = int(s[1])
                self.quadgram_data_total += self.quadgram_data[s[0]]

    def check(self, word):
        quadgrams = []
        for i in range(len(word) - 3):
            quadgrams.append(word[i:i+4])
        probs = [ math.log10(self.quadgram_data.get(q, 1) / self.quadgram_data_total) for q in quadgrams ]
        return sum(probs)

# -------- Ciphers --------

def encode_caeser(pt, a, shift=3):
    pt, a = list(pt), list(a)
    ct = []
    for l in pt:
        ct.append(a[(a.index(l) + shift) % len(a)])
    return "".join(ct) if isinstance(pt[0], str) else ct

def encode_substitute(pt, pt_a, ct_a):
    pt, pt_a, ct_a = list(pt), list(pt_a), list(ct_a)
    ct = []
    for l in pt:
        ct.append(ct_a[pt_a.index(l)])
    return "".join(ct) if isinstance(pt[0], str) else ct

def encode_caeser_progressive_word(pt, a, shift=3, increment=1, seperator=" "):
    pt, a = list(pt), list(a)
    ct = []
    for l in pt:
        if l == seperator:
            shift += 1
            ct.append(seperator)
        else:
            ct.append(a[(a.index(l) + shift) % len(a)])
    return "".join(ct) if isinstance(pt[0], str) else ct

def encode_caeser_progressive_letter(pt, a, shift=3, increment=1):
    pt, a = list(pt), list(a)
    ct = []
    for l in pt:
        ct.append(a[(a.index(l) + shift) % len(a)])
        shift += increment
    return "".join(ct) if isinstance(pt[0], str) else ct

def encode_wadsworth(pt, pt_a, ct_a, delta_func=lambda d, pt, l : d):
    pt, pt_a, ct_a = list(pt), list(pt_a), list(ct_a)
    ct = []

    pt_index = 0
    ct_index = 0
    for l in pt:
        pt_l_index = pt_a.index(l)
        pt_delta = pt_l_index - pt_index
        if pt_delta <= 0: pt_delta += len(pt_a)
        ct_delta = delta_func(pt_delta, pt, l)

        pt_index = (pt_index + pt_delta) % len(pt_a)
        ct_index = (ct_index + ct_delta) % len(ct_a)
        ct.append(ct_a[ct_index])

    return "".join(ct) if isinstance(pt[0], str) else ct

class JosseCipher:
    # https://www.tandfonline.com/doi/pdf/10.1080/01611194.2021.1996484
    # Overall:  M -> MV -> UV -> CV -> C
    # encypt:   (M) plaintext           -> (C) ciphertext
    # S:        (MV) numeric plaintext  -> (UV) unordered numeric plaintext

    def __init__(self, a):
      # Setup alphabet
      self.a = a
      self.map_a_to_v = { }
      self.map_v_to_a = { }
      for v, m in enumerate(self.a):
          self.map_a_to_v[m] = v
          self.map_v_to_a[v] = m
      self.key_wrapped = None
      self.S = None
      self.S_I = None
      self.hasKey = False
    
    def set_key(self, keyword):
        # Prepare key for encoding
        keyword_clean = "".join(dict.fromkeys(keyword))
        key_ext = keyword_clean
        for a in self.a:
            if a not in key_ext:
              key_ext += a
        self.key_wrapped = textwrap.wrap(key_ext, len(keyword_clean))

        # Generate the key S
        self.S = { }
        self.S_I = { }
        uv = 0
        for col in range(len(keyword_clean)):
            for row in range(len(self.key_wrapped)):
                if (len(self.key_wrapped[row])) > col:
                    mv = self.map_a_to_v[self.key_wrapped[row][col]]
                    self.S[mv] = uv
                    self.S_I[uv] = mv
                    uv += 1
        self.hasKey = True

    def modA(self, v):
        while v < 0:
            v += len(self.a)
        return v % len(self.a)

    def encrypt(self, msg_m):
        # Convert msgM -> msgMV and pass on
        msg_mv = [ self.map_a_to_v[m] for m in msg_m ]
        return self.encrypt_mv(msg_mv)

    def encrypt_mv(self, msg_mv):
        # Encrypt msgMV -> msgC using josse cipher
        msg_uv = [ self.S[mv] for mv in msg_mv ]
        msg_cv = []
        for i in range(len(msg_mv)):
            if i == 0:    msg_cv.append( self.modA(-self.S[msg_mv[i]] - 2))
            elif i == 1:  msg_cv.append( self.modA(self.S[msg_mv[i]] - msg_cv[i - 1] - 1) )
            else:         msg_cv.append( self.modA(self.S[msg_mv[i]] + msg_cv[i - 1] + 1) )
        msg_c = "".join([ str(self.map_v_to_a[self.S_I[cv]]) for cv in msg_cv ])
        return ( msg_mv, msg_uv, msg_cv, msg_c )

    def decrypt(self, msg_c):
        # Convert msgC -> msgCV and pass on
        msg_cv = [ self.map_a_to_v[c] for c in msg_c ]
        return self.decrypt_cv(msg_cv)

    def decrypt_cv(self, msg_cv):
        msg_mv = []
        for i in range(len(msg_cv)):
            if i == 0:    msg_mv.append( self.S_I[ self.modA(-self.S[msg_cv[i]] - 2 ) ] )
            elif i == 1:  msg_mv.append( self.S_I[ self.modA(self.S[msg_cv[i]] + self.S[msg_cv[i - 1]] + 1) ] )
            else:         msg_mv.append( self.S_I[ self.modA(self.S[msg_cv[i]] - self.S[msg_cv[i - 1]] - 1) ] )
        msg_m = "".join([ str(self.map_v_to_a[mv]) for mv in msg_mv ])
        return ( msg_mv, msg_m )

    def log(self):
        # Print out values
        if self.a == None:
            return
        print("Alphabet (" + str(len(self.a)) + "): ", self.a)
        if self.key_wrapped != None: print("Key (S) Wrapped: ", self.key_wrapped)
        if self.S != None: print("Key (S): ", self.S)
        if self.S_I != None: print("Key (S) Inverse: ", self.S_I)
        if self.S != None: print("".join([ self.map_v_to_a[a] for a in self.S ]))
        if self.S != None: print("".join([ self.map_v_to_a[self.S[i]] for i in range(len(self.a)) ]))

class RotatingHomophonicCipher:
  def __init__(self, pt_a):
    # Construct CT buckets and alphabet
    current_bucket_end = 0
    self.buckets = {}
    for l in pt_a:
        size = random.randrange(2,4)
        self.buckets[l] = [current_bucket_end, current_bucket_end + size, -1]
        current_bucket_end += size
    self.ct_a = list(range(current_bucket_end))
    random.shuffle(self.ct_a)

  def encode(self, pt):
    # Encode PT to CT
    # For each PT letter:
    #   - Take current bucket letter
    #   - Cycle bucket
    #   - Cycle alphabet

    # setup variables and loop
    for l in self.buckets: self.buckets[l][2] = self.buckets[l][0]
    current_ct_a = self.ct_a.copy()
    ct = []
    for l in pt:
        
        # Add ciphertext
        ct.append(current_ct_a[self.buckets[l][2]])

        # Cycle bucket
        self.buckets[l][2] -= 1
        if self.buckets[l][2] < self.buckets[l][0]:
            self.buckets[l][2] = self.buckets[l][1] - 1

        # Cycle alphabet
        current_ct_a = current_ct_a[1:] + [current_ct_a[0]]
    return ct

class RandomModulusCipher:
    pt_alphabet: list
    ct_alphabet: list
    _pt: list

    def __init__(self, pt_alphabet: list, ct_alphabet: list):
        self.pt_alphabet = pt_alphabet
        self.ct_alphabet = ct_alphabet

    def p(self, i):
        return self._pt[i]
    
    def factor(self, i):
        return 2

    def c(self, i):
        return (self.p(i) * self.factor(i)) % len(self.ct_alphabet)

    def prepare_pt(self, m):
        cm = m.replace(" ", "").replace(".", "").lower()
        return [ self.pt_alphabet.index(l) for l in cm ]
    
    def encode(self, pt: list):
        self._pt = pt
        return [ self.c(i) for i,l in enumerate(pt) ]
