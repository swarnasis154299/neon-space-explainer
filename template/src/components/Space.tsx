import React from "react";
import { CAP, N } from "../data/style";
import { H, W } from "../data/timeline";
import { clamp, lerp, r, rng, spr } from "../lib/motion";
import { Glow, Grad } from "./Art";
import { shade, tint } from "./Character";

// Neon flat-vector space kit (original). Every piece is a pure function of time.

const circ = (cx: number, cy: number, rr: number) => `M${cx - rr},${cy} a${rr},${rr} 0 1,0 ${rr * 2},0 a${rr},${rr} 0 1,0 ${-rr * 2},0 Z`;
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0 Z`;

// ---------------------------------------------------------------- backdrops
/** deep-space gradient, nebula glows, star dust, four-point sparkles */
export const SpaceBg: React.FC<{ id: string; t: number; top?: string; bot?: string; seed?: number; neb?: number; drift?: number }> = ({ id, t, top = N.sp0, bot = N.sp2, seed = 5, neb = 1, drift = 6 }) => {
  const R = rng(seed);
  const stars = Array.from({ length: 190 }, () => ({ x: R() * W, y: R() * H, s: 0.7 + R() * 2.3, ph: R() * 6, o: 0.3 + R() * 0.6, c: R() }));
  const spark = Array.from({ length: 9 }, () => ({ x: R() * W, y: R() * H, s: 7 + R() * 10, ph: R() * 6, c: R() > 0.5 ? N.teal : N.pink }));
  const dy = t * drift;
  return (
    <g>
      {top !== "transparent" && <Grad id={`${id}bg`} stops={[[0, top], [0.55, shade(bot, 0.25)], [1, bot]]} />}
      {top !== "transparent" && <rect width={W} height={H} fill={`url(#${id}bg)`} />}
      <g opacity={neb}>
        <Glow id={`${id}n1`} cx={W * 0.85} cy={H * 0.25} r={620} color={N.neb} o={0.32} mid={0.5} />
        <Glow id={`${id}n2`} cx={W * 0.1} cy={H * 0.78} r={700} color={N.neb2} o={0.3} mid={0.5} />
      </g>
      {stars.map((s, i) => {
        const y = (((s.y - dy * (0.4 + s.s * 0.2)) % H) + H) % H;
        return <circle key={i} cx={s.x} cy={y} r={s.s} fill={s.c > 0.85 ? "#b7d4ff" : s.c > 0.75 ? "#ffd6f0" : "#fff8e8"} opacity={s.o * (0.55 + 0.45 * Math.sin(t * 2.2 + s.ph))} />;
      })}
      {spark.map((s, i) => {
        const k = 0.5 + 0.5 * Math.sin(t * 1.6 + s.ph);
        const y = (((s.y - dy) % H) + H) % H;
        return <path key={i} d={`M${s.x},${y - s.s} Q${s.x},${y} ${s.x + s.s},${y} Q${s.x},${y} ${s.x},${y + s.s} Q${s.x},${y} ${s.x - s.s},${y} Q${s.x},${y} ${s.x},${y - s.s} Z`} fill={s.c} opacity={0.35 + 0.5 * k} transform={`rotate(${i * 13} ${s.x} ${y})`} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- planets
/** flat planet: base disc + clipped surface + darker crescent on the night side + rim light + glow */
export const Planet: React.FC<{ id: string; x: number; y: number; r: number; base: string; dark?: string; rim?: string; glow?: string; night?: number; children?: React.ReactNode }> = ({ id, x, y, r: rr, base, dark, rim = "#ffffff", glow, night = 0.42, children }) => (
  <g>
    {glow && <Glow id={`${id}gl`} cx={x} cy={y} r={rr * 1.55} color={glow} o={0.55} mid={0.62} />}
    <defs>
      <clipPath id={`${id}c`}>
        <circle cx={x} cy={y} r={rr} />
      </clipPath>
    </defs>
    <circle cx={x} cy={y} r={rr} fill={base} />
    <g clipPath={`url(#${id}c)`}>
      {children}
      <path d={circ(x, y, rr * 1.05) + circ(x - rr * night, y - rr * night * 0.45, rr * 1.02)} fill={dark ?? shade(base, 0.5)} fillRule="evenodd" opacity={0.62} />
      <path d={circ(x, y, rr * 1.01) + circ(x + rr * 0.07, y + rr * 0.05, rr)} fill={rim} fillRule="evenodd" opacity={0.5} />
    </g>
  </g>
);

const CONT: [number, number, number, number][] = [
  [0.25, -0.32, 0.46, 0.34],
  [0.55, 0.28, 0.28, 0.48],
  [1.45, -0.42, 0.58, 0.3],
  [1.62, 0.12, 0.26, 0.42],
  [2.55, -0.18, 0.5, 0.46],
  [3.15, 0.52, 0.34, 0.24],
  [3.55, -0.58, 0.3, 0.2],
];
/** Earth surface (inside a Planet): rotating blob continents, ice caps, drifting clouds */
export const EarthSurf: React.FC<{ x: number; y: number; r: number; t: number; spin?: number; clouds?: boolean }> = ({ x, y, r: rr, t, spin = 0.05, clouds = true }) => {
  const off = (((t * spin) % 4) + 4) % 4;
  const R = rng(9);
  const bumps = CONT.map(() => Array.from({ length: 4 }, () => [(R() - 0.5) * 1.2, (R() - 0.5) * 1.1, 0.35 + R() * 0.4]));
  const cl = Array.from({ length: 7 }, () => [R() * 4, (R() - 0.5) * 1.6, 0.25 + R() * 0.4]);
  const place = (u: number, sp: number) => {
    const out: number[] = [];
    for (const k of [-4, 0, 4]) {
      const px = x + (u - off * sp + k - 2) * rr;
      if (Math.abs(px - x) < rr * 2) out.push(px);
    }
    return out;
  };
  return (
    <g>
      <circle cx={x - rr * 0.25} cy={y - rr * 0.2} r={rr * 0.7} fill={tint(N.ocean, 0.15)} opacity={0.6} />
      {CONT.map((c, i) =>
        place(c[0], 1).map((px, j) => (
          <g key={`${i}_${j}`}>
            <ellipse cx={px} cy={y + c[1] * rr} rx={c[2] * rr} ry={c[3] * rr} fill={N.land} />
            {bumps[i].slice(0, 3).map((b, m) => (
              <ellipse key={m} cx={px + b[0] * c[2] * rr} cy={y + c[1] * rr + b[1] * c[3] * rr} rx={b[2] * c[2] * rr} ry={b[2] * c[3] * rr} fill={N.land} />
            ))}
            {i % 2 === 0 && <ellipse cx={px + c[2] * rr * 0.45} cy={y + c[1] * rr - c[3] * rr * 0.1} rx={c[2] * rr * 0.28} ry={c[3] * rr * 0.22} fill={N.desert} opacity={0.9} />}
            <ellipse cx={px - c[2] * rr * 0.35} cy={y + c[1] * rr + c[3] * rr * 0.35} rx={c[2] * rr * 0.35} ry={c[3] * rr * 0.3} fill={N.land2} opacity={0.55} />
          </g>
        )),
      )}
      <ellipse cx={x} cy={y - rr * 0.98} rx={rr * 0.75} ry={rr * 0.2} fill={N.cap} />
      <ellipse cx={x} cy={y + rr * 0.99} rx={rr * 0.7} ry={rr * 0.16} fill={N.cap} />
      {clouds &&
        cl.map((c, i) =>
          place(c[0], 1.6).map((px, j) => <rect key={`${i}_${j}`} x={px - c[2] * rr * 0.6} y={y + c[1] * rr * 0.6} width={c[2] * rr * 1.2} height={rr * 0.075} rx={rr * 0.0375} fill="#fff" opacity={0.7} />),
        )}
    </g>
  );
};

export const Earth: React.FC<{ id: string; x: number; y: number; r: number; t: number; spin?: number; glow?: boolean; extra?: React.ReactNode }> = ({ id, x, y, r: rr, t, spin, glow = true, extra }) => (
  <Planet id={id} x={x} y={y} r={rr} base={N.ocean} dark="#0b1f7a" rim="#bfe6ff" glow={glow ? "#3b8bff" : undefined}>
    <EarthSurf x={x} y={y} r={rr} t={t} spin={spin} clouds={rr > 30} />
    {extra}
  </Planet>
);

/** icy moonlet with craters */
export const IceMoon: React.FC<{ id: string; x: number; y: number; r: number }> = ({ id, x, y, r: rr }) => (
  <Planet id={id} x={x} y={y} r={rr} base="#cfe0ff" dark="#4f5fb8" rim="#ffffff" glow="#9fc0ff">
    <circle cx={x - rr * 0.3} cy={y - rr * 0.2} r={rr * 0.28} fill="#a9bdf2" />
    <circle cx={x + rr * 0.35} cy={y + rr * 0.3} r={rr * 0.2} fill="#a9bdf2" />
    <circle cx={x - rr * 0.1} cy={y + rr * 0.45} r={rr * 0.12} fill="#a9bdf2" />
    <circle cx={x + rr * 0.2} cy={y - rr * 0.5} r={rr * 0.1} fill="#a9bdf2" />
  </Planet>
);

// ---------------------------------------------------------------- rings
export type Band = [number, number, string, number]; // inner, outer (× R), colour, opacity
export const ICE_BANDS: Band[] = [
  [1.42, 1.62, N.ice3, 0.55],
  [1.62, 1.95, N.ice1, 0.9],
  [1.95, 2.02, N.ice4, 0.25],
  [2.02, 2.35, N.ice0, 0.95],
  [2.35, 2.42, N.ice2, 0.4],
  [2.42, 2.6, N.ice2, 0.75],
];
export const SAT_BANDS: Band[] = [
  [1.25, 1.45, "#c79a7a", 0.5],
  [1.45, 1.85, "#f6dcb4", 0.95],
  [1.85, 1.95, "#7c5a6a", 0.25],
  [1.95, 2.25, "#ffe9c8", 1],
  [2.25, 2.3, "#5a3d5a", 0.2],
  [2.3, 2.45, "#e8c69c", 0.85],
];
/** elliptical annulus ring; half = back (behind planet) / front / all. tilt = ry/rx. k fades + thins it */
export const Ring: React.FC<{ id: string; cx: number; cy: number; R: number; tilt: number; rot?: number; bands: Band[]; half?: "back" | "front" | "all"; k?: number; hair?: string; shadow?: boolean }> = ({ id, cx, cy, R, tilt, rot = 0, bands, half = "all", k = 1, hair = "#ffffff", shadow = true }) => {
  if (k <= 0.001) return null;
  const ty = Math.max(0.004, Math.abs(tilt));
  const big = R * 4;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`} opacity={k}>
      <defs>
        <clipPath id={`${id}h`}>
          <rect x={cx - big} y={half === "front" ? cy : cy - big} width={big * 2} height={half === "all" ? big * 2 : big} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}h)`}>
        {bands.map(([a, b, c, o], i) => (
          <path key={i} d={ell(cx, cy, R * b, R * b * ty) + ell(cx, cy, R * a, R * a * ty)} fill={c} fillRule="evenodd" opacity={o} />
        ))}
        {/* fine ringlets */}
        {ty > 0.03 &&
          bands.map(([a, b, c], i) =>
            [0.3, 0.55, 0.8].map((f, j) => {
              const rr = R * lerp(a, b, f);
              return <ellipse key={`${i}_${j}`} cx={cx} cy={cy} rx={rr} ry={rr * ty} fill="none" stroke={j === 1 ? "#ffffff" : shade(c, 0.35)} strokeWidth={j === 1 ? 1.6 : 2.2} opacity={j === 1 ? 0.35 : 0.22} />;
            }),
          )}
        {/* the planet's shadow falling across the back of the ring (light from the upper left) */}
        {shadow && half === "back" && ty > 0.03 && (() => {
          const ph = (-40 * Math.PI) / 180;
          const u = [Math.cos(ph), Math.sin(ph)];
          const v = [-u[1], u[0]];
          const P = (s: number, w: number) => `${(cx + u[0] * s + v[0] * w).toFixed(1)},${(cy + (u[1] * s + v[1] * w) * ty).toFixed(1)}`;
          const Lr = R * 3;
          const OUT = bands[bands.length - 1][1];
          const IN = bands[0][0];
          return (
            <g>
              <defs>
                <clipPath id={`${id}an`}>
                  <path d={ell(cx, cy, R * OUT, R * OUT * ty) + ell(cx, cy, R * IN, R * IN * ty)} clipRule="evenodd" />
                </clipPath>
              </defs>
              <polygon points={`${P(0, -R * 0.98)} ${P(Lr, -R * 0.98)} ${P(Lr, R * 0.98)} ${P(0, R * 0.98)}`} fill="#0a0630" opacity={0.6} clipPath={`url(#${id}an)`} />
            </g>
          );
        })()}
        {ty < 0.06 && <line x1={cx - R * bands[bands.length - 1][1]} y1={cy} x2={cx + R * bands[bands.length - 1][1]} y2={cy} stroke={hair} strokeWidth={4} strokeLinecap="round" opacity={clamp((0.06 - ty) / 0.03)} />}
      </g>
    </g>
  );
};

/** the ring's own shadow on the planet (use inside a Planet/Earth `extra`, i.e. already clipped to the disc) */
export const RingShadow: React.FC<{ cx: number; cy: number; R: number; tilt: number; rot?: number; bands: Band[]; k?: number }> = ({ cx, cy, R, tilt, rot = 0, bands, k = 1 }) => {
  const ty = Math.max(0.02, tilt);
  const a = bands[0][0];
  const b = bands[bands.length - 1][1];
  const dy = R * 0.16;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`} opacity={0.42 * k}>
      <defs>
        <clipPath id={`rsf${Math.round(cx)}_${Math.round(cy)}`}>
          <rect x={cx - R * 3} y={cy} width={R * 6} height={R * 3} />
        </clipPath>
      </defs>
      <path d={ell(cx + R * 0.05, cy + dy, R * b, R * b * ty) + ell(cx + R * 0.05, cy + dy, R * a, R * a * ty)} fill="#0a0630" fillRule="evenodd" clipPath={`url(#rsf${Math.round(cx)}_${Math.round(cy)})`} transform={`translate(0 ${-R * b * ty * 0.0})`} />
    </g>
  );
};

/** ringed planet with correct back/front layering */
export const Ringed: React.FC<{ id: string; cx: number; cy: number; R: number; tilt: number; rot?: number; bands: Band[]; k?: number; planet: React.ReactNode; mid?: React.ReactNode }> = ({ id, cx, cy, R, tilt, rot = 0, bands, k = 1, planet, mid }) => (
  <g>
    <Ring id={`${id}b`} cx={cx} cy={cy} R={R} tilt={tilt} rot={rot} bands={bands} half="back" k={k} />
    {planet}
    {mid}
    <Ring id={`${id}f`} cx={cx} cy={cy} R={R} tilt={tilt} rot={rot} bands={bands} half="front" k={k} />
  </g>
);

// ---------------------------------------------------------------- sky arch (a ring seen from the ground)
/** the ring as seen from the surface: a banded arch rising from the horizon. gap = dark wedge of Earth's shadow (night) */
export const SkyArch: React.FC<{ id: string; cx: number; cy: number; rx: number; ry: number; w?: number; k?: number; glow?: number; gap?: number; horizon: number }> = ({ id, cx, cy, rx, ry, w = 1, k = 1, glow = 0.5, gap = 0, horizon }) => {
  if (k <= 0.001) return null;
  const bands: [number, number, string, number][] = [
    [0, 0.05, N.ice3, 0.55],
    [0.05, 0.13, N.ice1, 0.9],
    [0.13, 0.145, N.ice4, 0.3],
    [0.145, 0.22, N.ice0, 0.95],
    [0.22, 0.235, N.ice2, 0.4],
    [0.235, 0.28, N.ice2, 0.8],
  ];
  const S = 0.28 * w;
  return (
    <g opacity={k}>
      <defs>
        <clipPath id={`${id}a`}>
          <rect x={-200} y={-200} width={W + 400} height={horizon + 200} />
        </clipPath>
        <radialGradient id={`${id}sh`} cx="0.5" cy="0" r="0.5">
          <stop offset="0" stopColor="#0a0630" stopOpacity={0.95} />
          <stop offset="0.7" stopColor="#0a0630" stopOpacity={0.85} />
          <stop offset="1" stopColor="#0a0630" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}a)`}>
        <path d={ell(cx, cy, rx * (1 + S * 0.5), ry * (1 + S * 0.5)) + ell(cx, cy, rx * (1 - S * 0.5) * 0.98, ry * (1 - S * 0.5) * 0.98)} fill="#cdd8ff" fillRule="evenodd" opacity={0.18 * glow} />
        {bands.map(([a, b, c, o], i) => {
          const fo = 1 - a * w;
          const fi = 1 - b * w;
          return <path key={i} d={ell(cx, cy, rx * fo, ry * fo) + ell(cx, cy, rx * fi, ry * fi)} fill={c} fillRule="evenodd" opacity={o} />;
        })}
        {gap > 0 && <ellipse cx={cx} cy={cy - ry * (1 - S * 0.5)} rx={rx * 0.16 * gap} ry={ry * S * 0.42} fill={`url(#${id}sh)`} opacity={0.75} />}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- labels
const textW = (s: string, size: number) => s.length * size * 0.56;
/** rounded tag pill on a leader line that points at (x, y). dir 1 = pill above, -1 = below */
export const Tag: React.FC<{ t: number; at: number; out?: number; x: number; y: number; text: string; color: string; size?: number; stem?: number; dir?: 1 | -1; sub?: string; subColor?: string; dx?: number }> = ({ t, at, out = 1e9, x, y, text, color, size = 40, stem = 70, dir = 1, sub, subColor, dx = 0 }) => {
  if (t < at || t > out + 0.3) return null;
  const p = spr(t, at, 13, 0.5);
  const o = clamp(p * 3) * (1 - r(t, out, out + 0.22));
  const sc = clamp(p, 0, 1.2) * (1 - 0.3 * r(t, out, out + 0.22));
  const w = textW(text, size) + size * 1.1;
  const h = size * 1.45;
  const py = y - dir * stem;
  const cy = dir > 0 ? py - h / 2 : py + h / 2;
  const ln = clamp(r(t, at, at + 0.25));
  return (
    <g opacity={o}>
      <line x1={x} y1={y} x2={lerp(x, x + dx, ln)} y2={lerp(y, py, ln)} stroke={color} strokeWidth={size * 0.13} strokeLinecap="round" />
      <g transform={`translate(${x + dx} ${cy}) scale(${sc})`}>
        <rect x={-w / 2} y={-h / 2 + 5} width={w} height={h} rx={h / 2} fill={shade(color, 0.35)} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} />
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={CAP} fontWeight={600} fontSize={size} fill="#fff">
          {text}
        </text>
        {sub && (
          <text x={0} y={dir > 0 ? -h / 2 - size * 0.35 : h / 2 + size * 0.85} textAnchor="middle" fontFamily={CAP} fontWeight={600} fontSize={size * 0.6} fill={subColor ?? tint(color, 0.3)}>
            {sub}
          </text>
        )}
      </g>
    </g>
  );
};

/** zoom-inset card: rounded frame with a thick border, content in local coords (0,0 = card centre), optional stem to a target */
export const Card: React.FC<{ id: string; t: number; at: number; out?: number; x: number; y: number; w: number; h: number; border: string; bg: string; to?: [number, number]; children: React.ReactNode }> = ({ id, t, at, out = 1e9, x, y, w, h, border, bg, to, children }) => {
  if (t < at || t > out + 0.3) return null;
  const p = spr(t, at, 11, 0.55);
  const sc = clamp(p, 0, 1.15) * (1 - r(t, out, out + 0.25));
  const o = clamp(p * 3) * (1 - r(t, out, out + 0.25));
  const rad = 44;
  return (
    <g opacity={o}>
      {to && <line x1={to[0]} y1={to[1]} x2={lerp(to[0], x, clamp(p))} y2={lerp(to[1], y + (to[1] > y ? h / 2 : -h / 2), clamp(p))} stroke={border} strokeWidth={10} strokeLinecap="round" />}
      <g transform={`translate(${x} ${y}) scale(${sc})`}>
        <defs>
          <clipPath id={`${id}cc`}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={rad} />
          </clipPath>
        </defs>
        <rect x={-w / 2 - 12} y={-h / 2 - 12 + 8} width={w + 24} height={h + 24} rx={rad + 12} fill="#000" opacity={0.3} />
        <rect x={-w / 2 - 12} y={-h / 2 - 12} width={w + 24} height={h + 24} rx={rad + 12} fill={border} />
        <g clipPath={`url(#${id}cc)`}>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={bg} />
          {children}
        </g>
      </g>
    </g>
  );
};

export const NotToScale: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <text x={64} y={110} fontFamily={CAP} fontWeight={600} fontSize={30} fill="#7d63d8" opacity={0.85 * k}>
    Not to scale
  </text>
);

// ---------------------------------------------------------------- captions + title (HTML)
const chunk = (text: string) => {
  const ws = text.split(" ");
  const out: string[] = [];
  let cur: string[] = [];
  ws.forEach((w, i) => {
    cur.push(w);
    const last = i === ws.length - 1;
    const rest = ws.length - 1 - i;
    if (last || cur.length >= 3 || (/[,:…]$/.test(w) && cur.length >= 1) || (cur.length === 2 && rest === 1 && false)) {
      out.push(cur.join(" "));
      cur = [];
    }
  });
  // avoid a lone trailing word
  if (out.length > 1 && out[out.length - 1].split(" ").length === 1 && out[out.length - 2].split(" ").length < 3 && !/[,:…]$/.test(out[out.length - 2])) {
    const l = out.pop()!;
    out[out.length - 1] += " " + l;
  }
  return out;
};
/** reference-style caption: 2–3 words at a time, bold white, centred lower third */
export const Caption: React.FC<{ t: number; at: number; out: number; text: string; y?: number; size?: number }> = ({ t, at, out, text, y = 1500, size = 54 }) => {
  if (t < at || t > out) return null;
  const parts = chunk(text);
  const lens = parts.map((p) => p.length + 6);
  const tot = lens.reduce((a, b) => a + b, 0);
  let acc = at;
  let idx = 0;
  let st = at;
  for (let i = 0; i < parts.length; i++) {
    const d = ((out - at) * lens[i]) / tot;
    if (t >= acc) {
      idx = i;
      st = acc;
    }
    acc += d;
  }
  const p = spr(t, st, 16, 0.6);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", transform: `translateY(-50%) scale(${lerp(0.86, 1, clamp(p, 0, 1.1))})`, opacity: clamp(p * 2.5) }}>
      <span style={{ fontFamily: CAP, fontWeight: 600, fontSize: size, color: "#fff", whiteSpace: "nowrap", textShadow: "0 3px 0 rgba(10,4,40,0.55), 0 0 18px rgba(10,4,40,0.65), 0 0 4px rgba(10,4,40,0.8)" }}>{parts[idx]}</span>
    </div>
  );
};

/** chunky rounded title with a thick outline (hook card) */
export const Title: React.FC<{ t: number; at: number; out: number; small: string; big: string; y?: number }> = ({ t, at, out, small, big, y = 300 }) => {
  if (t < at || t > out + 0.4) return null;
  const k = 1 - r(t, out, out + 0.3);
  const ps = spr(t, at, 12, 0.55);
  const stroke = (c: string, wdt: number): React.CSSProperties => ({ WebkitTextStroke: `${wdt}px ${c}`, paintOrder: "stroke fill" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: k }}>
      <div style={{ fontFamily: CAP, fontWeight: 700, fontSize: 70, color: "#fff", transform: `scale(${clamp(ps, 0, 1.2)})`, ...stroke("#3a1580", 14), textShadow: "0 8px 0 #1c0a4a" }}>{small}</div>
      <div style={{ marginTop: -10, position: "relative" }}>
        <TitleRing t={t} at={at + 0.6} half="back" />
        {big.split("").map((ch, i) => {
          const p = spr(t, at + 0.25 + i * 0.07, 12, 0.45);
          return (
            <span key={i} style={{ position: "relative", zIndex: 1, display: "inline-block", fontFamily: CAP, fontWeight: 700, fontSize: 220, lineHeight: 1, color: "#d9c6ff", transform: `translateY(${(1 - clamp(p, 0, 1.3)) * 60}px) scale(${clamp(p, 0, 1.25)}) rotate(${Math.sin(t * 2 + i) * 2}deg)`, ...stroke("#3a1580", 22), textShadow: "0 12px 0 #1c0a4a" }}>
              {ch}
            </span>
          );
        })}
        <TitleRing t={t} at={at + 0.6} half="front" />
      </div>
    </div>
  );
};
/** an icy ring that swoops in around the title word (back half behind the letters, front half over them) */
const TitleRing: React.FC<{ t: number; at: number; half: "back" | "front" }> = ({ t, at, half }) => {
  if (t < at) return null;
  const p = spr(t, at, 7, 0.6);
  const rot = lerp(-38, -7, clamp(p, 0, 1.2)) + Math.sin(t * 1.3) * 1.5;
  const s = lerp(0.2, 1, clamp(p, 0, 1.1));
  const tilt = lerp(0.6, 0.2, clamp(p)) + Math.sin(t * 1.1) * 0.015;
  const cx = W / 2;
  const cy = 150;
  const Rr = 300 * s;
  return (
    <svg width={W} height={320} style={{ position: "absolute", left: 0, top: -40, overflow: "visible", pointerEvents: "none", zIndex: half === "front" ? 2 : 0, opacity: clamp(p * 3) }}>
      <Ring id={`tr${half}`} cx={cx} cy={cy} R={Rr / 1.3} tilt={tilt} rot={rot} bands={ICE_BANDS.map(([a, b, c, o]) => [a * 0.8, b * 0.8, c, o] as Band)} half={half} shadow={false} />
    </svg>
  );
};

// ---------------------------------------------------------------- characters
/** "Pip" — original round critter sidekick with glowing antennae */
export const Pip: React.FC<{ x: number; y: number; s?: number; t: number; look?: [number, number]; mood?: "happy" | "wow" | "worried"; face?: 1 | -1; hop?: number; point?: number }> = ({ x, y, s = 1, t, look = [0.3, -0.5], mood = "happy", face = 1, hop = 0, point = 0 }) => {
  const bob = Math.abs(Math.sin(t * 3.2)) * 3 + hop;
  const sq = 1 + Math.sin(t * 6.4) * 0.015;
  const blink = (t * 0.9) % 3.1 > 3.0 ? 0.15 : 1;
  const ant = Math.sin(t * 4) * 6;
  return (
    <g transform={`translate(${x} ${y - bob * s}) scale(${s * face} ${s})`}>
      <ellipse cx={0} cy={bob + 2} rx={44} ry={9} fill="#000" opacity={0.18} />
      {/* feet */}
      <ellipse cx={-18} cy={-4} rx={14} ry={8} fill={N.critD} />
      <ellipse cx={18} cy={-4} rx={14} ry={8} fill={N.critD} />
      {/* antennae */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M${sd * 14},-92 Q${sd * 22 + ant * sd * 0.3},-122 ${sd * 26 + ant},-136`} stroke={N.critD} strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={sd * 26 + ant} cy={-138} r={16} fill={N.gold} opacity={0.3} />
          <circle cx={sd * 26 + ant} cy={-138} r={8} fill="#ffe08a" />
        </g>
      ))}
      {/* body */}
      <g transform={`scale(${1 / sq} ${sq})`} style={{ transformOrigin: "0 0" }}>
        <ellipse cx={0} cy={-50} rx={50} ry={50} fill={N.crit} />
        <path d={circ(0, -50, 51) + circ(-14, -58, 50)} fill={N.critD} fillRule="evenodd" opacity={0.7} />
        <ellipse cx={4} cy={-30} rx={28} ry={20} fill={N.critB} opacity={0.9} />
        {/* arm */}
        <path d={`M30,-40 Q${48 + point * 10},${-50 - point * 40} ${44 + point * 6},${-36 - point * 58}`} stroke={N.critD} strokeWidth={11} fill="none" strokeLinecap="round" />
        {/* eyes */}
        {[-15, 15].map((ex, i) => (
          <g key={i}>
            <ellipse cx={ex + 6} cy={-62} rx={13} ry={15 * blink} fill="#fff" />
            <circle cx={ex + 6 + look[0] * 6} cy={-62 + look[1] * 7 * blink} r={6.5 * blink} fill="#1a0f3a" />
            <circle cx={ex + 8 + look[0] * 6} cy={-65 + look[1] * 7 * blink} r={2.2 * blink} fill="#fff" />
          </g>
        ))}
        {mood === "wow" ? <ellipse cx={8} cy={-36} rx={7} ry={9} fill="#1a0f3a" /> : mood === "worried" ? <path d="M-2,-34 Q8,-40 18,-34" stroke="#1a0f3a" strokeWidth={4} fill="none" strokeLinecap="round" /> : <path d="M-2,-38 Q8,-28 18,-38" stroke="#1a0f3a" strokeWidth={4} fill="none" strokeLinecap="round" />}
        <circle cx={-10} cy={-42} r={6} fill={N.pink} opacity={0.35} />
        <circle cx={26} cy={-42} r={6} fill={N.pink} opacity={0.35} />
      </g>
    </g>
  );
};

/** small refracting telescope on a tripod, pointing at `ang` degrees above horizontal */
export const Scope: React.FC<{ x: number; y: number; s?: number; ang?: number }> = ({ x, y, s = 1, ang = 38 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0,-90 L-38,0 M0,-90 L36,0 M0,-90 L4,0" stroke="#2a1458" strokeWidth={7} strokeLinecap="round" />
    <g transform={`translate(0 -96) rotate(${-ang})`}>
      <rect x={-50} y={-14} width={130} height={28} rx={12} fill="#f4ecff" />
      <rect x={-50} y={-14} width={130} height={10} rx={5} fill="#ffffff" />
      <rect x={60} y={-18} width={30} height={36} rx={8} fill={N.violet} />
      <rect x={-62} y={-9} width={18} height={18} rx={5} fill={N.violet} />
    </g>
  </g>
);

/** comic speech bubble with a tail pointing down-left to (x, y) */
export const Bubble: React.FC<{ t: number; at: number; out?: number; x: number; y: number; text: string; size?: number }> = ({ t, at, out = 1e9, x, y, text, size = 46 }) => {
  if (t < at || t > out + 0.3) return null;
  const p = spr(t, at, 14, 0.45);
  const o = clamp(p * 3) * (1 - r(t, out, out + 0.2));
  const w = textW(text, size) + size * 1.4;
  const h = size * 1.8;
  const bx = x + 40;
  const by = y - 120;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${clamp(p, 0, 1.25)}) translate(${-x} ${-y}) rotate(${Math.sin(t * 9) * 1.5} ${bx} ${by})`}>
      <path d={`M${x},${y} L${bx - w * 0.15},${by + h / 2 - 6} L${bx + w * 0.05},${by + h / 2 - 6} Z`} fill="#fff" />
      <rect x={bx - w / 2} y={by - h / 2 + 6} width={w} height={h} rx={h / 2} fill="#1c0a4a" opacity={0.35} />
      <rect x={bx - w / 2} y={by - h / 2} width={w} height={h} rx={h / 2} fill="#fff" />
      <text x={bx} y={by + size * 0.36} textAnchor="middle" fontFamily={CAP} fontWeight={700} fontSize={size} fill="#5a1fd0">
        {text}
      </text>
    </g>
  );
};
