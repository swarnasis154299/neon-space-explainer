// "What if Earth had rings?" — original score + sound design (Web Audio, seeded, no samples).
// Wordless: the music leads. 96 BPM (beat 0.625 s, bar 2.5 s). C major wonder → A minor tension → bright theme → darker → mystery → warm return.
import { NOTE, makeKit } from "./kit.ts";
import type { Ctx } from "./kit.ts";
import { T, DURATION } from "../data/timeline.ts";

const n = (x: string) => NOTE[x.replace("Bb", "A#").replace("Eb", "D#")];

export const buildScore = (ctx: Ctx) => {
  const k = makeKit(ctx, 466);
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
  // ================= 01 HOOK — rooftop night, twinkles, the title lands
  pad(0, T.s2 + 0.1, ["F2", "C3", "A3", "E4", "G4"], 0.38, 1100, 0.6, 0.2);
  sub(0, n("F1") * 2, T.s2, 0.07);
  impact(T.title, 0.5, 55);
  whoosh(T.title - 0.25, 0.4, 0.06, 1);
  for (let i = 0; i < 6; i++) pop(T.title + 0.25 + i * 0.07, 600 + i * 120, 0.045);
  shimmer(T.title + 0.1, ["C6", "E6", "G6", "B6"], 0.035);
  for (let i = 0, t = 1.25; t < T.s2 - 0.3; i++, t += B) bell(t, n(["G5", "E5", "C6", "A5", "G5", "E5", "D5", "C5"][i % 8]), 0.04, i % 2 ? 0.4 : -0.4, 1.6);
  for (let t = 0.2; t < T.s2; t += 0.04 + r() * 0.2) tick(t, 0.006);
  riser(T.s2 - 1.2, T.s2, n("C4"), n("G4"), 0.03);

  // ================= 02 SATURN — the groove starts
  kick(T.s2, 0.35);
  shimmer(T.s2, ["G5", "C6", "E6"], 0.03);
  groove(T.s2, T.s3, [C, Am, F, G], { drums: 0.9 });
  pop(T.s2 + 0.3, 880, 0.05);
  pop(T.saturnCard, 760, 0.05);
  for (let i = 0; i < 6; i++) clink(T.saturnCard + 0.2 + i * 0.17, 0.012, 2800 + r() * 1400); // ice chunks
  whoosh(T.ruler - 0.3, 0.45, 0.06, -1);
  pop(T.ruler + 0.3, 990, 0.05);
  whoosh(T.edge - 0.1, 0.7, 0.07, 1);
  pop(T.edge + 0.6, 1180, 0.05);

  // ================= 03 THE ICY MOON — A minor tension, a pull, the shred
  pad(T.s3, T.shred, ["A2", "E3", "A3", "C4", "F4"], 0.34, 900, 0.1, 0.1);
  sub(T.s3, n("A1"), T.shred - T.s3, 0.09);
  for (let t = T.s3, i = 0; t < T.shred - 0.05; t += B / 2, i++) {
    pizz(t, n(i % 2 ? "E4" : "A3"), 0.05, i % 2 ? 0.3 : -0.3);
    if (i % 2 === 0) kick(t, 0.16 + (t - T.s3) * 0.04);
  }
  pop(T.s3 + 0.25, 700, 0.04);
  pop(T.roche, 880, 0.045);
  pop(T.s3 + 0.6, 1040, 0.04);
  riser(T.s3 + 0.6, T.shred, n("A3"), n("A4"), 0.05);
  bed(T.s3 + 0.8, T.shred, 0.05, "lowpass", 160, 1); // gravity rumble
  impact(T.shred, 0.85, 46);
  crumble(T.shred, 1.3, 0.22);
  whoosh(T.shred, 1.2, 0.08, -1);
  pad(T.shred, T.s4 + 0.1, ["D3", "A3", "D4", "F4"], 0.3, 1000, 0.1, 0.2);
  for (let t = T.shred + 0.4; t < T.s4 + 2.5; t += 0.05 + r() * 0.12) clink(t, 0.007, 2600 + r() * 2400); // debris tinkle

  // ================= 04 THE RING FORMS — the wonder chord
  impact(T.s4, 0.4, 60);
  pad(T.s4, T.upgraded + 0.1, ["F2", "C3", "F3", "A3", "C4", "E4", "G4"], 0.45, 2200, 0.4, 0.2);
  sub(T.s4, n("F1"), T.upgraded - T.s4, 0.09);
  strings(T.s4, n("C5"), T.upgraded - T.s4, 0.025, -0.2, 0.8);
  strings(T.s4, n("E5"), T.upgraded - T.s4, 0.022, 0.2, 0.8);
  for (let i = 0, t = T.s4 + 0.1; t < T.upgraded - 0.1; i++, t += B / 2) bell(t, n(["C6", "G5", "E6", "A5", "D6", "G5", "E6", "C6"][i % 8]), 0.045, i % 2 ? 0.45 : -0.45, 1.8);
  riser(T.upgraded - 1.2, T.upgraded, n("G3"), n("C5"), 0.04);
  kick(T.upgraded, 0.4);
  pop(T.upgraded, 1180, 0.06);
  shimmer(T.upgraded + 0.02, ["C6", "E6", "G6", "C7"], 0.04, 0.05);
  groove(T.upgraded, T.s5, [C], { drums: 1 });

  // ================= 05–07 THE VIEW — main theme (day → equator/poles → night)
  groove(T.s5, T.s7, [C, G, Am, F], { drums: 1, mel: theme, melV: 0.07 });
  wind(T.s5, T.s6, 0.04);
  for (let i = 0; i < 4; i++) gull(T.s5 + 0.8 + i * 0.7, 0.014, (r() - 0.5) * 1.4);
  whoosh(T.s6 - 0.2, 0.4, 0.05, 1);
  pop(T.s6 + 0.3, 880, 0.05);
  waves(T.s6, 27.5, 0.04, 1.8);
  whoosh(27.25, 0.55, 0.08, -1);
  pop(27.9, 990, 0.05);
  wind(27.5, T.s7, 0.06);
  groove(T.s7, T.s8, [F, C, Am, G], { drums: 0.35, arp: 0.7, padV: 0.4, cut: 1300, mel: ["C6", "-", "B5", "G5", "A5", "-", "E5", "G5"], melV: 0.06 });
  for (let i = 0, t = T.s7 + 0.3; t < T.s8 - 0.2; i++, t += B * 0.75) bell(t, n(["E6", "G6", "C7", "B6"][i % 4]), 0.022, (r() - 0.5) * 1.2, 2);
  for (let t = T.s7; t < T.s8; t += 0.05 + r() * 0.25) tick(t);

  // ================= 08–09 THE COST — darker groove
  impact(T.s8, 0.4, 50);
  groove(T.s8, T.s10, [Am, F, Dm, E], { drums: 0.85, padV: 0.34, cut: 1100 });
  pop(T.s8 + 1.0, 760, 0.05);
  wind(T.winter, T.s9, 0.06);
  pop(T.winter, 880, 0.05);
  pop(T.winter + 0.25, 990, 0.04);
  pop(T.s9 + 0.4, 880, 0.05);
  for (let t = T.s9; t < T.s10; t += B * 2) bell(t, n("E6"), 0.02, 0.5, 0.6); // satellite blip
  whoosh(T.hit - 0.3, 0.4, 0.07, -1);
  [0.25, 0.7, 1.15, 1.6, 2.05].forEach((d) => {
    clink(T.hit + d, 0.05, 1800 + r() * 900);
    crumble(T.hit + d, 0.12, 0.12);
  });
  bed(T.hit, T.s10, 0.035, "bandpass", 1400, 0.8); // gravel hiss

  // ================= 10 SHOOTING STARS — bright and sparkly
  groove(T.s10, T.s11, [F, G, C, Am], { drums: 0.7, mel: ["A5", "C6", "E6", "D6", "C6", "G5", "E5", "G5"], melV: 0.06 });
  for (let i = 0; i < 18; i++) {
    const t = T.s10 + 0.3 + i * 0.26;
    if (i % 2 === 0) whoosh(t, 0.5, i === 8 ? 0.09 : 0.03, i % 4 ? 1 : -1);
    bell(t + 0.15, n(["C7", "G6", "E6", "A6", "D7", "B6"][i % 6]), 0.02, (r() - 0.5) * 1.4, 1.2);
  }

  // ================= 11 PLOT TWIST — rewind, then the ancient sea
  riser(T.s11, T.ord, n("C5"), n("C3"), 0.05); // falling pitch = rewind
  for (let t = T.s11, i = 0; t < T.ord; t += 0.09, i++) whoosh(t, 0.12, 0.02, i % 2 ? 1 : -1);
  impact(T.ord, 0.75, 44);
  splash(T.ord, 0.35);
  pad(T.ord, T.s12 + 0.2, ["D2", "A2", "E3", "F3", "C4", "E4"], 0.42, 1100, 0.4, 0.2);
  sub(T.ord, n("D1") * 2, T.s12 - T.ord, 0.09);
  for (let i = 0, t = T.ord + 0.3; t < T.s12 - 0.2; i++, t += B) {
    pizz(t, n(["D4", "A4", "F4", "E4", "C4", "A3"][i % 6]), 0.045, i % 2 ? 0.3 : -0.3);
    if (i % 2 === 0) kick(t, 0.14);
    if (i % 4 === 1) bell(t, n(["A5", "E6", "F6", "C6"][(i >> 2) % 4]), 0.04, 0, 2.2);
  }
  waves(T.ord, T.s12, 0.035, 2.4);
  for (let t = T.ord + 0.5; t < T.s12; t += 0.1 + r() * 0.35) bubble(t, 0.016);
  pop(53.75, 880, 0.05);
  pop(54.6, 1040, 0.04);

  // ================= 12 IT FALLS APART — descending, little impacts
  pad(T.s12, T.s13 + 0.4, ["Bb2", "F3", "Bb3", "D4"], 0.36, 1000, 0.2, 0.4);
  sub(T.s12, n("Bb1"), T.s13 - T.s12, 0.08);
  for (let i = 0, t = T.s12; t < T.s13 - 0.05; i++, t += B / 2) pizz(t, n(["F5", "D5", "Bb4", "F4", "D4", "Bb3", "F3", "D3"][i % 8]), 0.04, i % 2 ? 0.3 : -0.3);
  for (let i = 0; i < 14; i++) tom(T.s12 + 0.55 + i * 0.16, 0.06, 70 + r() * 30);
  pop(T.s12 + 0.9, 760, 0.04);

  // ================= 13 BACK ON THE ROOF — warm return, final chord
  groove(T.s13, 62.75, [C, Am], { drums: 0.45, arp: 0.8, padV: 0.38, mel: ["E5", "G5", "C6", "B5", "A5", "G5", "E5", "-"], melV: 0.06 });
  shimmer(60.6, ["C6", "E6", "G6", "B6", "D7"], 0.03, 0.12); // the ghost ring
  for (let t = T.s13; t < END; t += 0.05 + r() * 0.22) tick(t, 0.005);
  kick(62.75, 0.3);
  pad(62.75, END, ["F2", "C3", "F3", "A3", "C4", "E4", "G4"], 0.5, 1800, 0.2, 1.4);
  sub(62.75, n("F1"), END - 62.75, 0.09);
  strings(62.75, n("A4"), END - 62.75, 0.024, -0.2, 0.3);
  strings(62.75, n("E5"), END - 62.75, 0.02, 0.2, 0.3);
  bell(62.8, n("C6"), 0.05, -0.2, 3);
  bell(62.84, n("G6"), 0.04, 0.2, 3);
  pop(63.25, 1180, 0.04);
  bell(63.6, n("E6"), 0.035, 0, 2.5);

  // ================= POLISH — a swish + soft kick on every hard cut, the title ring, Pip's bubble, the close-up
  [T.s2, T.s3, T.s5, 22.45, T.s6, T.s7, T.s8, T.s9, T.s10, T.s11, T.ord].forEach((c) => {
    whoosh(c - 0.28, 0.36, 0.045, 1);
    kick(c, 0.18);
  });
  whoosh(T.title + 0.5, 0.9, 0.07, 1); // ring swoops around the title
  shimmer(T.title + 0.9, ["E6", "G6", "C7"], 0.03, 0.09);
  pop(T.s11 + 0.25, 1400, 0.06); // speech bubble
  pop(T.s11 + 0.05, 520, 0.06); // Pip springs up
  shimmer(22.6, ["G5", "C6", "E6", "G6"], 0.03, 0.06);
  pop(23.25, 700, 0.05); // Pip pops into the close-up
};
