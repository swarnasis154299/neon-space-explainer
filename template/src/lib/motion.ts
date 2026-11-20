import { Easing, interpolate } from "remotion";

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const EASE = Easing.bezier(0.22, 1, 0.36, 1); // expo-out-ish
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const r = (t: number, a: number, b: number, e = EASE) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
export const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) => Math.min(r(t, a, a + fi), 1 - r(t, b - fo, b, INOUT));
/** damped spring step response (0→1 with a soft overshoot), deterministic */
export const spr = (t: number, a: number, k = 9, z = 0.55) => {
  const x = t - a;
  if (x <= 0) return 0;
  const wd = k * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * k * x) * (Math.cos(wd * x) + ((z * k) / wd) * Math.sin(wd * x));
};
/** keyed scalar track [t, value, dur] with smoothstep transitions */
export const track = (keys: [number, number, number][], t: number) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ts, val, d] = keys[i];
    if (t < ts) break;
    v = lerp(v, val, sstep(0, 1, (t - ts) / Math.max(1e-3, d)));
  }
  return v;
};
export const snoise = (t: number, s: number) => Math.sin(t * 1.31 + s * 12.9) * 0.5 + Math.sin(t * 2.17 + s * 4.1) * 0.3 + Math.sin(t * 3.73 + s * 7.7) * 0.2;
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};
