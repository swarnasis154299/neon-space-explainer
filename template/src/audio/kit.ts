// Shared Web Audio building blocks (buses, noise, envelopes). Deterministic (seeded).

export type Ctx = BaseAudioContext;

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const NOTE: Record<string, number> = (() => {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const out: Record<string, number> = {};
  for (let o = 0; o < 8; o++) names.forEach((n, i) => (out[n + o] = 440 * Math.pow(2, (o * 12 + i - 57) / 12)));
  return out;
})();

export type Kit = ReturnType<typeof makeKit>;

export const makeKit = (ctx: Ctx, seed: number) => {
  const r = rng(seed);
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
  const noise = (t: number, dur: number) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    src.start(t, r() * 3);
    src.stop(t + dur + 0.05);
    return src;
  };
  const osc = (type: OscillatorType, f: number, t: number, dur: number) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  };
  const filt = (type: BiquadFilterType, f: number, q = 0.7) => {
    const b = ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    return b;
  };
  const pan = (dest: AudioNode, p: number) => {
    const sp = ctx.createStereoPanner();
    sp.pan.value = Math.max(-1, Math.min(1, p));
    sp.connect(dest);
    return sp;
  };
  const env = (g: GainNode, t: number, a: number, peak: number, dcy: number) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy);
  };
  const swell = (g: GainNode, t0: number, t1: number, peak: number, att: number, rel: number) => {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + att);
    g.gain.setValueAtTime(peak, Math.max(t0 + att, t1 - rel));
    g.gain.linearRampToValueAtTime(0.0001, t1);
  };
  return { r, noise, osc, filt, pan, env, swell };
};
