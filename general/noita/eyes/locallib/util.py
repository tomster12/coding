
import string

# -------- General --------


class UID:
    def __init__(self):
        self.next = 0
        self.map = {}
        self.invMap = {}

    def get_uid(self, val):
        if val not in self.map:
            self.map[val] = self.next
            self.next += 1
            self.invMap[self.next] = val
        return self.map[val]


def to_base(num, base):
    base_num = ""
    while num > 0:
        dig = int(num % base)
        if dig < 10:
            base_num += str(dig)
        else:
            base_num += chr(ord('A')+dig-10)
        num //= base
    base_num = base_num[::-1]
    return base_num


def wrap_mod(v, m):
    return (v + m) % m


def text_diff(alphabet, t0, t1):
    full_diff = []
    for i in range(min(len(t0), len(t1))):
        i0 = alphabet.index(t0[i])
        i1 = alphabet.index(t1[i])
        diff = wrap_mod(i0 - i1, len(alphabet))
        full_diff += "-" if (diff == 0) else alphabet[diff - 1]
    return "".join(full_diff)
