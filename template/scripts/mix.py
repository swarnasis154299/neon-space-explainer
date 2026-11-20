"""Final mix: narration (dominant, gentle compression) + score/SFX bed."""
import numpy as np, soundfile as sf
v, sr = sf.read("public/voice.wav")
s, sr2 = sf.read("public/score.wav")
if s.ndim == 1: s = np.stack([s, s], 1)
N = max(len(v), len(s))
V = np.zeros(N); V[:len(v)] = v
Sc = np.zeros((N, 2)); Sc[:len(s)] = s
db = lambda x: 10 ** (x / 20)
# slow leveller: 1 s RMS windows, smoothed over ~4 s, pulled toward a target (max ±9 dB) — continuous, even BGM
hop = sr // 2
m = Sc.mean(1)
nw = len(m) // hop + 1
lev = np.array([np.sqrt((m[i * hop:(i + 2) * hop] ** 2).mean() + 1e-12) for i in range(nw)])
k = np.ones(9) / 9
lev = np.convolve(np.pad(lev, 4, mode="edge"), k, "valid")
target = np.median(lev)
gain = np.clip(target / lev, db(-9), db(9))
gain = np.interp(np.arange(N), np.arange(nw) * hop, gain)
Sc = Sc * gain[:, None]
vn = V / np.abs(V).max()
voice = np.tanh(vn * 1.8) / np.tanh(1.8) * db(-3.0)
out = Sc * db(-2.5) + np.stack([voice, voice], 1)
pk = np.abs(out).max()
out = out / pk * db(-1.0) if pk > db(-1.0) else out
sf.write("public/master.wav", out.astype(np.float32), sr, subtype="PCM_16")
m = out.mean(1)
print("master", N / sr, "s  peak", round(20 * np.log10(np.abs(out).max()), 2), "dB  rms", round(20 * np.log10(np.sqrt((m ** 2).mean())), 2), "dB")
