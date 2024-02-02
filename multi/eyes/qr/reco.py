import json
import cv2
import numpy as np
from crypto import *

def stack(img):
    """
    Stack the color channels of a [h,w,3] image into a [h*3,w] grayscale image
    """
    return np.vstack([img[:,:,c] for c in range(3)])

def destack(stacked):
    """
    Unstack a [h*3,w] grayscale image into a [h,w,3] color image
    """
    imageheight = stacked.shape[0] // 3
    return np.dstack([stacked[i*imageheight:(i+1)*imageheight] for i in range(3)])

def make_noise(table, rowsize):
    (noisetable, offsets) = table
    return np.vstack([noisetable[o:o+rowsize] for o in offsets])

def load_tables(fn):
    with open("perfect_tables.json", "rt") as src:
        jdata = json.load(src)

    rawtables = [np.array(v, dtype=int) for v in jdata['tables']]
    rawoffsets = jdata['offsets']

    return list(zip(rawtables, rawoffsets))

def saturate_add(base, addition):
    ret = base.astype(float) + addition.astype(float)
    ret = np.maximum(0.0, np.minimum(255.0, ret))
    return ret

def full_reconstruction(tables, base_image):
    base_image = stack(base_image)
    rowsize = base_image.shape[1]
    noise_sm = make_noise(tables[0], rowsize)
    noise_lg = make_noise(tables[1], rowsize)
    image = saturate_add(base_image, noise_sm)
    image = saturate_add(image, noise_lg)
    return destack(image.astype(np.uint8))

def do_reco():
    tables = load_tables("perfect_tables.json")
    qrcode_clean = cv2.imread("qr_clean.png")[:, :, 0:3]

    reco = full_reconstruction(tables, qrcode_clean)
    cv2.imwrite("perfect_reconstruction.png", reco)

    actual_qr = cv2.imread("qr.png")[:, :, 0:3]
    diff = actual_qr.astype(int) - reco.astype(int)

    print("Avg. difference of reconstruction vs. real QR code:", np.mean(np.abs(diff)))
    print("# of different pixels in reconstruction:", np.sum(diff != 0))

if __name__ == "__main__":
    do_reco()
