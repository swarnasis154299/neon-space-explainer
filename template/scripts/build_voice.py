"""Lay the Fish Audio phrases onto the master timeline. Audio is untouched; only the pauses between phrases change.
Word onsets/offsets are refined on the waveform (Whisper pads word starts with the preceding silence).
Writes public/voice.wav + src/data/script.json.   python scripts/build_voice.py"""
import json
import math
import numpy as np
import soundfile as sf

SR = 48000
TAKES = ["1"]  # one entry per refs/vo{n}-48k.wav + refs/words{n}.json
takes = {k: sf.read(f"refs/vo{k}-48k.wav")[0] for k in TAKES}
words = {k: json.load(open(f"refs/words{k}.json")) for k in TAKES}


def norm(w):
    return w.lower().strip(",.?!")


def idx(take, text, k=0):
    hits = [i for i, w in enumerate(words[take]) if norm(w["w"]) == text]
    return hits[k]


def rms_db(a):
    pk = np.abs(a).max()
    hop = SR // 100
    n = len(a) // hop
    fr = a[: n * hop].reshape(n, hop)
    return 20 * np.log10(np.sqrt((fr ** 2).mean(1)) / pk + 1e-9)


DB = {k: rms_db(v) for k, v in takes.items()}


def onset(take, s, e, th=-32, q=-50):
    """first rise above `th` that follows a quiet stretch (skips the previous word's tail inside Whisper's padded start)"""
    d = DB[take]
    f, end = int(s * 100), int(e * 100)
    if d[f] > q:  # starting inside sound: wait for >=40 ms of quiet first
        run = 0
        while f < end and run < 4:
            run = run + 1 if d[f] < q else 0
            f += 1
        if f >= end:
            return s
    while f < end and d[f] <= th:
        f += 1
    return f / 100


def offset(take, s, e, th=-42, q=-50):
    """end of the word: forward until >=60 ms of quiet; if Whisper's end already sits in silence, search backwards"""
    d = DB[take]
    f = int(max(s, e - 0.1) * 100)
    if d[f] < q:
        while f > int(s * 100) and d[f] < th:
            f -= 1
        return (f + 1) / 100
    run = 0
    while f < len(d) and run < 6:
        run = run + 1 if d[f] < q else 0
        f += 1
    return (f - 6) / 100


# (id, take, first word, last word, planned onset, min gap after previous phrase)
# planned onset None = follow the previous phrase by `gap`
PLAN = [
    # One row per spoken phrase, in order. (id, take, (first word, k), (last word, k), planned onset or None, min gap after previous, grid)
    # Words are lower-case and stripped of ,.?!  — k is the occurrence index of that word INSIDE THE TAKE (repeated words like
    # "the", "and", "on", "town", "day" are the classic bug). Numbers come back from Whisper as digits ("17", "380").
    # Gaps >= 1.2 s read as scene changes; ~0.4-0.7 s within a scene. The script widens every gap slightly for measured pacing.
    ("intro", "1", ("first", 0), ("last", 0), 1.2, 0, 0.01),
    # ("next", "1", ("word", 0), ("word", 0), None, 0.5, 0.01),
]
FORCE_END = {}
TAIL = 5.5

def quiet(a, t0, t1):
    s0, s1 = int(t0 * SR), int(t1 * SR)
    if s1 - s0 < 960:
        return (t0 + t1) / 2
    x = a[s0:s1] ** 2
    e = np.convolve(x, np.ones(480) / 480, "valid")
    return (s0 + int(np.argmin(e)) + 240) / SR


laid = []
prev_end = 0.0
for cid, take, (w0, k0), (w1, k1), at, gap, grid in PLAN:
    ws = words[take]
    a = takes[take]
    i0, i1 = idx(take, w0, k0), idx(take, w1, k1)
    on = onset(take, ws[i0]["s"], ws[i0]["e"])
    nxt = ws[i1 + 1]["s"] if i1 + 1 < len(ws) else len(a) / SR
    nxt_on = onset(take, ws[i1 + 1]["s"], ws[i1 + 1]["e"]) if i1 + 1 < len(ws) else len(a) / SR
    off = FORCE_END.get(cid) or offset(take, ws[i1]["s"], ws[i1]["e"])
    prev_off = offset(take, ws[i0 - 1]["s"], on) if i0 > 0 else 0.0
    c0 = quiet(a, max(prev_off, on - 0.18), on - 0.005) if i0 > 0 else 0.0
    c1 = FORCE_END.get(cid) or (quiet(a, off, min(nxt_on - 0.01, off + 0.2)) if i1 + 1 < len(ws) else len(a) / SR)
    gap = gap + (0.4 if gap >= 1.2 else 0.1) if gap > 0 else 0  # measured, documentary pacing
    m_on = max(at if at is not None else 0, prev_end + gap)
    m_on = math.ceil(m_on / grid - 1e-6) * grid  # phrases start on the music grid
    shift = m_on - on
    laid.append(dict(id=cid, take=take, i0=i0, i1=i1, c0=c0, c1=c1, shift=shift, on=on, off=off))
    prev_end = off + shift

DURATION = round(prev_end + TAIL, 2)
out = np.zeros(int(DURATION * SR) + SR)
mw, clips = [], []
for L in laid:
    a = takes[L["take"]]
    seg = a[int(L["c0"] * SR): int(L["c1"] * SR)].copy()
    f = int(0.006 * SR)
    fo = int((0.025 if L["id"] in FORCE_END else 0.006) * SR)
    seg[:f] *= np.linspace(0, 1, f)
    seg[-fo:] *= np.linspace(1, 0, fo)
    s = int((L["c0"] + L["shift"]) * SR)
    out[s: s + len(seg)] += seg
    ws = words[L["take"]]
    for j in range(L["i0"], L["i1"] + 1):
        w = ws[j]
        st = L["on"] if j == L["i0"] else w["s"]
        en = L["off"] if j == L["i1"] else w["e"]
        mw.append({"w": norm(w["w"]), "s": round(st + L["shift"], 3), "e": round(en + L["shift"], 3), "clip": L["id"]})
    clips.append({"id": L["id"], "s": round(L["on"] + L["shift"], 3), "e": round(L["off"] + L["shift"], 3)})
    print(f"{L['id']:13s} {L['on'] + L['shift']:6.2f} – {L['off'] + L['shift']:6.2f}")
out = out[: int(DURATION * SR)]
sf.write("public/voice.wav", out.astype(np.float32), SR, subtype="PCM_16")
json.dump({"duration": DURATION, "clips": clips, "words": mw}, open("src/data/script.json", "w"), indent=1)
print("duration", DURATION)
