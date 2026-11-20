// Starter score: full instrument kit + groove helper. Replace the ARRANGEMENT with sections that follow your story.
// 96 BPM (beat 0.625 s, bar 2.5 s). Linear ramps only — never setTargetAtTime (blows up offline). See examples/earth-rings/score.ts.
import { NOTE, makeKit } from "./kit.ts";
import type { Ctx } from "./kit.ts";
import { T, DURATION } from "../data/timeline.ts";

const n = (x: string) => NOTE[x.replace("Bb", "A#").replace("Eb", "D#")];

export const buildScore = (ctx: Ctx) => {
  const k = makeKit(ctx, 7);
  const { noise, osc, filt, pan, env, swell, r } = k;
  const END = DURATION;
  const B = 0.625;
  // ---- buses ----
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  const rev = ctx.createConvolver();
  {
    const len = Math.round(ctx.sampleRate * 3.6);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    rev.buffer = ir;
  }
  const revOut = ctx.createGain();
  revOut.gain.value = 0.4;
  rev.connect(revOut).connect(master);
  const music = ctx.createGain();
  music.gain.value = 0.95;
  music.connect(master);
  const sfx = ctx.createGain();
  sfx.gain.value = 0.55;
  sfx.connect(master);
  const send = (src: AudioNode, amt: number) => {
    const g = ctx.createGain();
    g.gain.value = amt;
    src.connect(g).connect(rev);
  };
  send(music, 0.45);
  send(sfx, 0.22);

  // ---- instruments ----
  const pad = (t0: number, t1: number, notes: string[], v: number, cut: number, att = 0.8, rel = 0.8) => {
    if (t1 - t0 < 0.05) return;
    const g = ctx.createGain();
    swell(g, t0, t1, v, Math.min(att, (t1 - t0) / 2), Math.min(rel, (t1 - t0) / 2));
    const lp = filt("lowpass", cut, 0.6);
    lp.connect(g).connect(music);
    notes.forEach((nt, i) =>
      [-7, 7].forEach((det) => {
        const o = osc(i % 2 ? "triangle" : "sawtooth", n(nt), t0, t1 - t0);
        o.detune.value = det + i;
        const og = ctx.createGain();
        og.gain.value = 0.06 / notes.length;
        o.connect(og).connect(pan(lp, det / 9));
      }),
    );
  };
  const bell = (t: number, f: number, v = 0.05, p = 0, dur = 2) => {
    [1, 3.01, 5.2].forEach((m, i) => {
      const g = ctx.createGain();
      env(g, t, 0.003, v / (1 + i * 2.5), dur / (1 + i));
      osc("sine", f * m, t, dur).connect(g).connect(pan(music, p));
    });
  };
  const keys = (t: number, f: number, v = 0.06, dur = 1.6, p = 0) => {
    [1, 2, 3].forEach((m, i) => {
      const g = ctx.createGain();
      env(g, t, 0.005, v / (1 + i * 1.8), dur / (1 + i * 0.7));
      osc(i ? "sine" : "triangle", f * m, t, dur).connect(g).connect(pan(music, p));
    });
  };
  const pizz = (t: number, f: number, v = 0.05, p = 0) => {
    const g = ctx.createGain();
    env(g, t, 0.002, v, 0.22);
    const lp = filt("lowpass", 1800, 1.5);
    lp.frequency.setValueAtTime(2600, t);
    lp.frequency.exponentialRampToValueAtTime(400, t + 0.2);
    osc("sawtooth", f, t, 0.3).connect(lp).connect(g).connect(pan(music, p));
  };
  const strings = (t: number, f: number, dur: number, v = 0.05, p = 0, att = 0.08) => {
    const g = ctx.createGain();
    swell(g, t, t + dur, v, Math.min(att, dur / 3), Math.min(0.2, dur / 3));
    const lp = filt("lowpass", 2400, 0.8);
    [-8, 8].forEach((d) => {
      const o = osc("sawtooth", f, t, dur);
      o.detune.value = d;
      o.connect(lp);
    });
    lp.connect(g).connect(pan(music, p));
  };
  const tom = (t: number, v = 0.4, f = 80) => {
    const g = ctx.createGain();
    env(g, t, 0.003, v, 0.6);
    const o = osc("sine", f * 1.8, t, 0.7);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.12);
    o.connect(g).connect(music);
    const ng = ctx.createGain();
    env(ng, t, 0.001, v * 0.25, 0.08);
    noise(t, 0.1).connect(filt("lowpass", 900)).connect(ng).connect(music);
  };
  const shaker = (t: number, v = 0.02) => {
    const g = ctx.createGain();
    env(g, t, 0.004, v, 0.06);
    noise(t, 0.08).connect(filt("highpass", 6000, 0.7)).connect(g).connect(pan(music, 0.25));
  };
  const sub = (t: number, f: number, dur: number, v = 0.1) => {
    const g = ctx.createGain();
    swell(g, t, t + dur, v, 0.4, 0.6);
    osc("sine", f, t, dur).connect(g).connect(music);
  };
  const impact = (t: number, v = 0.5, low = 55) => {
    const g = ctx.createGain();
    env(g, t, 0.003, v, 2.2);
    const o = osc("sine", low * 1.6, t, 2.4);
    o.frequency.exponentialRampToValueAtTime(low * 0.5, t + 1.6);
    o.connect(g).connect(sfx);
    const ng = ctx.createGain();
    env(ng, t, 0.002, v * 0.5, 1.0);
    noise(t, 1.1).connect(filt("lowpass", 220)).connect(ng).connect(sfx);
  };
  const whoosh = (t: number, dur = 0.6, v = 0.1, dir = 1) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const bp = filt("bandpass", 600, 0.8);
    bp.frequency.setValueAtTime(dir > 0 ? 400 : 3500, t);
    bp.frequency.exponentialRampToValueAtTime(dir > 0 ? 3500 : 400, t + dur);
    const sp = ctx.createStereoPanner();
    sp.pan.setValueAtTime(0.7 * dir, t);
    sp.pan.linearRampToValueAtTime(-0.7 * dir, t + dur);
    sp.connect(sfx);
    noise(t, dur + 0.05).connect(bp).connect(g).connect(sp);
  };
  const riser = (t0: number, t1: number, f0: number, f1: number, v = 0.05) => {
    [1, 1.5].forEach((m, i) => {
      const g = ctx.createGain();
      swell(g, t0, t1, v / (1 + i), (t1 - t0) * 0.85, 0.1);
      const o = osc(i ? "triangle" : "sawtooth", f0 * m, t0, t1 - t0);
      o.frequency.exponentialRampToValueAtTime(f1 * m, t1);
      o.connect(filt("lowpass", 2400)).connect(g).connect(pan(music, i ? 0.3 : -0.3));
    });
  };
  const pop = (t: number, f = 880, v = 0.05) => {
    const g = ctx.createGain();
    env(g, t, 0.002, v, 0.12);
    const o = osc("sine", f, t, 0.15);
    o.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.06);
    o.connect(g).connect(pan(sfx, (r() - 0.5) * 0.8));
  };
  // ---- sound design ----
  const bed = (t0: number, t1: number, v: number, type: BiquadFilterType, f: number, q = 0.7, p = 0) => {
    const g = ctx.createGain();
    swell(g, t0, t1, v, Math.min(0.6, (t1 - t0) / 3), Math.min(0.6, (t1 - t0) / 3));
    noise(t0, t1 - t0).connect(filt(type, f, q)).connect(g).connect(pan(sfx, p));
  };
  const wind = (t0: number, t1: number, v: number) => {
    const g = ctx.createGain();
    swell(g, t0, t1, v, 0.6, 0.4);
    const bp = filt("bandpass", 700, 2.2);
    for (let t = t0; t < t1; t += 0.4) bp.frequency.linearRampToValueAtTime(400 + r() * 900, t);
    noise(t0, t1 - t0).connect(bp).connect(g).connect(sfx);
  };
  const thunder = (t: number, v = 0.5) => {
    const g = ctx.createGain();
    env(g, t, 0.01, v, 2.4);
    noise(t, 2.6).connect(filt("lowpass", 260, 0.8)).connect(g).connect(sfx);
    const c = ctx.createGain();
    env(c, t, 0.001, v * 0.5, 0.25);
    noise(t, 0.3).connect(filt("bandpass", 1800, 0.8)).connect(c).connect(sfx);
  };
  const waves = (t0: number, t1: number, v: number, period = 2.4) => {
    for (let t = t0; t < t1 - 0.2; t += period * (0.8 + r() * 0.4)) {
      const g = ctx.createGain();
      const d = Math.min(period * 1.2, t1 - t);
      swell(g, t, t + d, v, d * 0.45, d * 0.5);
      noise(t, d).connect(filt("bandpass", 500 + r() * 400, 0.5)).connect(g).connect(pan(sfx, (r() - 0.5) * 1.2));
    }
  };
  const crackle = (t0: number, t1: number, v: number) => {
    for (let t = t0; t < t1; t += 0.02 + r() * 0.08) {
      const g = ctx.createGain();
      env(g, t, 0.0005, v * (0.3 + r() * 0.7), 0.01 + r() * 0.03);
      noise(t, 0.05).connect(filt("bandpass", 1500 + r() * 4000, 1.5)).connect(g).connect(pan(sfx, r() * 1.4 - 0.7));
    }
  };
  const clink = (t: number, v = 0.05, f = 2400) => {
    [1, 1.55, 2.3].forEach((m, i) => {
      const g = ctx.createGain();
      env(g, t, 0.001, v / (1 + i), 0.25);
      osc("square", f * m, t, 0.3).connect(filt("bandpass", f * m, 4)).connect(g).connect(pan(sfx, 0.3 - i * 0.3));
    });
  };
  const gull = (t: number, v = 0.03, p = 0) => {
    [0, 0.22].forEach((dt) => {
      const g = ctx.createGain();
      env(g, t + dt, 0.01, v, 0.18);
      const o = osc("triangle", 1500, t + dt, 0.22);
      o.frequency.setValueAtTime(1300, t + dt);
      o.frequency.linearRampToValueAtTime(2100, t + dt + 0.06);
      o.frequency.linearRampToValueAtTime(1100, t + dt + 0.2);
      o.connect(g).connect(pan(sfx, p));
    });
  };
  const bubble = (t: number, v = 0.03) => {
    const g = ctx.createGain();
    env(g, t, 0.002, v, 0.07);
    const f = 400 + r() * 700;
    const o = osc("sine", f, t, 0.1);
    o.frequency.exponentialRampToValueAtTime(f * 2.2, t + 0.08);
    o.connect(g).connect(pan(sfx, (r() - 0.5) * 1.2));
  };
  const crumble = (t0: number, dur: number, v: number) => {
    for (let t = t0; t < t0 + dur; t += 0.02 + r() * 0.06) {
      const g = ctx.createGain();
      env(g, t, 0.001, v * (0.4 + r() * 0.6), 0.05 + r() * 0.1);
      noise(t, 0.2).connect(filt("bandpass", 200 + r() * 900, 1.2)).connect(g).connect(pan(sfx, (r() - 0.5) * 1.2));
    }
  };
  const splash = (t: number, v = 0.3) => {
    const g = ctx.createGain();
    env(g, t, 0.005, v, 0.9);
    noise(t, 1).connect(filt("bandpass", 1400, 0.6)).connect(g).connect(sfx);
    const g2 = ctx.createGain();
    env(g2, t, 0.003, v * 0.6, 0.4);
    noise(t, 0.5).connect(filt("lowpass", 400)).connect(g2).connect(sfx);
  };

  const kick = (t: number, v = 0.3) => {
    const g = ctx.createGain();
    env(g, t, 0.002, v, 0.35);
    const o = osc("sine", 150, t, 0.4);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    o.connect(g).connect(music);
  };
  const snap = (t: number, v = 0.06) => {
    const g = ctx.createGain();
    env(g, t, 0.001, v, 0.12);
    noise(t, 0.15).connect(filt("bandpass", 2200, 0.9)).connect(g).connect(pan(music, -0.1));
  };
  const tick = (t: number, v = 0.007) => {
    const g = ctx.createGain();
    env(g, t, 0.001, v, 0.03);
    osc("sine", 4200 + r() * 600, t, 0.04).connect(g).connect(pan(sfx, (r() - 0.5) * 1.4));
  };
  const shimmer = (t: number, notes: string[], v = 0.035, step = 0.07) => notes.forEach((nt, i) => bell(t + i * step, n(nt), v, (i % 2 ? 1 : -1) * 0.4, 1.6));

  // groove helper: bars of chord + bass + arp + drums (+ optional melody on the beat)
  type Bar = { pad: string[]; bass: string; arp: string[] };
  const groove = (t0: number, t1: number, bars: Bar[], o: { drums?: number; arp?: number; padV?: number; cut?: number; mel?: string[]; melV?: number }) => {
    const { drums = 1, arp = 1, padV = 0.32, cut = 1500, mel, melV = 0.065 } = o;
    for (let bi = 0, b0 = t0; b0 < t1 - 0.05; bi++, b0 += B * 4) {
      const p = bars[bi % bars.length];
      const b1 = Math.min(t1, b0 + B * 4);
      pad(b0, b1 + 0.05, p.pad, padV, cut, 0.08, 0.1);
      sub(b0, n(p.bass), b1 - b0, 0.085);
      for (let j = 0; j < 8; j++) {
        const t = b0 + (j * B) / 2;
        if (t >= t1 - 0.02) break;
        if (arp > 0) pizz(t, n(p.arp[j % p.arp.length]), 0.045 * arp, j % 2 ? 0.35 : -0.35);
        if (drums > 0) {
          if (j % 4 === 0) kick(t, 0.28 * drums);
          if (j % 4 === 2) snap(t, 0.05 * drums);
          shaker(t + B / 4, 0.018 * drums);
        }
        if (mel && j % 2 === 0) {
          const m = mel[(bi * 4 + j / 2) % mel.length];
          if (m !== "-") keys(t, n(m), melV, 1.1, 0.1);
        }
      }
    }
  };
  const C: Bar = { pad: ["C3", "G3", "C4", "E4"], bass: "C2", arp: ["C5", "E5", "G5", "E5"] };
  const Am: Bar = { pad: ["A2", "E3", "A3", "C4"], bass: "A1", arp: ["A4", "C5", "E5", "C5"] };
  const F: Bar = { pad: ["F2", "C3", "F3", "A3", "E4"], bass: "F1", arp: ["F4", "A4", "C5", "E5"] };
  const G: Bar = { pad: ["G2", "D3", "G3", "B3"], bass: "G1", arp: ["G4", "B4", "D5", "B4"] };
  const Dm: Bar = { pad: ["D3", "A3", "D4", "F4"], bass: "D2", arp: ["D5", "F5", "A5", "F5"] };
  const E: Bar = { pad: ["E2", "B2", "E3", "G#3"], bass: "E1", arp: ["E4", "G#4", "B4", "G#4"] };
  const theme = ["E5", "G5", "C6", "B5", "A5", "G5", "E5", "G5", "F5", "A5", "C6", "D6", "B5", "G5", "D5", "-"];

  void thunder;
  void crackle;
  void gull;
  void bubble;
  void splash;
  void waves;
  void crumble;
  void Dm;
  void E;
  void tick;
  void strings;
  void tom;
  void bed;
  void wind;
  void clink;

  // ================= ARRANGEMENT (example — matches the starter timeline)
  // hook: soft pad, twinkles, title impact + pops
  pad(0, T.s2 + 0.1, ["F2", "C3", "A3", "E4", "G4"], 0.38, 1100, 0.6, 0.2);
  sub(0, n("F1") * 2, T.s2, 0.07);
  impact(T.title, 0.5, 55);
  whoosh(T.title - 0.25, 0.4, 0.06, 1);
  for (let i = 0; i < 6; i++) pop(T.title + 0.25 + i * 0.07, 600 + i * 120, 0.045);
  shimmer(T.title + 0.1, ["C6", "E6", "G6", "B6"], 0.035);
  riser(T.s2 - 1.2, T.s2, n("C4"), n("G4"), 0.03);
  // body: groove + theme, a pop on every tag
  groove(T.s2, T.end - 2.5, [C, G, Am, F], { drums: 1, mel: theme, melV: 0.065 });
  pop(T.s2 + 0.3, 880, 0.05);
  pop(T.card, 760, 0.05);
  // ending: final chord
  pad(T.end - 2.5, END, ["F2", "C3", "F3", "A3", "C4", "E4", "G4"], 0.5, 1800, 0.2, 1.2);
  sub(T.end - 2.5, n("F1"), 2.5, 0.09);
  bell(T.end - 2.45, n("C6"), 0.05, -0.2, 3);
  bell(T.end - 2.4, n("G6"), 0.04, 0.2, 3);
  // a swish + soft kick on every hard cut
  [T.s2, T.s3].forEach((c) => {
    whoosh(c - 0.28, 0.36, 0.045, 1);
    kick(c, 0.18);
  });
};
