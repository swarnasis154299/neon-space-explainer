"""Word timestamps for narration takes refs/vo{n}-48k.wav (faster-whisper large-v3, CPU int8, numpy input).
Usage: python scripts/words.py 1 2 3 4   -> writes refs/words{n}.json. Slow (~2-4 min per minute of audio): run in the background."""
import json, sys, numpy as np, soundfile as sf, librosa
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
for n in [int(a) for a in sys.argv[1:]] or [1]:
    a, sr = sf.read(f"refs/vo{n}-48k.wav")
    x = librosa.resample(a.astype(np.float32), orig_sr=sr, target_sr=16000)
    segs, _ = m.transcribe(x, language="en", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    ws = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
    json.dump(ws, open(f"refs/words{n}.json", "w"), indent=1)
    print(n, " ".join(f"{w['w']}[{w['s']:.2f}]" for w in ws), flush=True)
