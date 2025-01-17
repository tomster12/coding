def process(txt):
    return ''.join([max(txt[i:i+3], key=txt[i:i+3].count) for i in range(0, len(txt), 3)])


print(process('000101010111'))  # 0101
