import React from "react";
import { AbsoluteFill } from "remotion";
import { CAP, P, PILL, TITLE } from "../data/style";
import { clamp, EASE, lerp, r, rng, spr } from "../lib/motion";
import { H, W } from "../data/timeline";
import { Character, Hair, Mood } from "./Character";

// Original storybook-history pieces. Everything is a pure function of time (deterministic).

const nz = (t: number, s: number) => Math.sin(t * 1.7 + s * 12.9) * 0.5 + Math.sin(t * 3.1 + s * 4.3) * 0.3 + Math.sin(t * 5.3 + s * 7.1) * 0.2;

/** fine grain + soft vignette */
export const Grain: React.FC<{ frame: number; k?: number; vig?: number }> = ({ frame, k = 0.06, vig = 0.4 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width="100%" height="100%" style={{ position: "absolute", mixBlendMode: "overlay", opacity: k * 5 }}>
      <filter id="gr">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed={Math.floor(frame / 2) % 61} stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.6 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#gr)" />
    </svg>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(14,6,30,${vig}) 100%)` }} />
  </AbsoluteFill>
);

export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
    {children}
  </svg>
);

/** camera: scale `s` about world point (fx, fy), which lands on screen point (ox, oy) */
export const cam = (s: number, fx = W / 2, fy = H / 2, ox = W / 2, oy = H / 2) => `translate(${ox} ${oy}) scale(${s}) translate(${-fx} ${-fy})`;
/** deterministic camera shake */
export const shake = (t: number, k: number) => (k > 0 ? `translate(${nz(t * 9, 1) * 14 * k} ${nz(t * 11, 2) * 10 * k})` : "");

export const Grad: React.FC<{ id: string; stops: [number, string][]; x2?: number; y2?: number }> = ({ id, stops, x2 = 0, y2 = 1 }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c], i) => (
        <stop key={i} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  </defs>
);

export const Glow: React.FC<{ id: string; cx: number; cy: number; r: number; color: string; o?: number; mid?: number }> = ({ id, cx, cy, r: rad, color, o = 1, mid = 0.35 }) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity={o} />
        <stop offset={mid} stopColor={color} stopOpacity={o * 0.35} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={rad} fill={`url(#${id})`} />
  </>
);

export const Stars: React.FC<{ t: number; n?: number; seed?: number; k?: number; h?: number }> = ({ t, n = 90, seed = 3, k = 1, h = 600 }) => {
  const R = rng(seed);
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => {
        const x = R() * W;
        const y = R() * h;
        const s = 0.8 + R() * 2.2;
        const tw = 0.55 + 0.45 * Math.sin(t * (1 + R() * 2) + i);
        return <circle key={i} cx={x} cy={y} r={s} fill="#fff6dc" opacity={tw * (0.35 + R() * 0.55)} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- sea & weather
/** one wave band filled to the bottom; crest gets a lighter rim */
export const Wave: React.FC<{ t: number; y: number; amp: number; wl: number; speed: number; color: string; crest?: string; ph?: number; bottom?: number; x0?: number; x1?: number }> = ({ t, y, amp, wl, speed, color, crest, ph = 0, bottom = H + 100, x0 = -60, x1 = W + 60 }) => {
  let d = "";
  for (let x = x0; x <= x1; x += 24) {
    const yy = y + amp * Math.sin((x / wl) * Math.PI * 2 + t * speed + ph) + amp * 0.38 * Math.sin((x / wl) * Math.PI * 3.3 - t * speed * 0.7 + ph * 2);
    d += `${x === x0 ? "M" : "L"}${x},${yy.toFixed(1)}`;
  }
  return (
    <g>
      <path d={`${d} L${x1},${bottom} L${x0},${bottom} Z`} fill={color} />
      {crest && <path d={d} fill="none" stroke={crest} strokeWidth={5} strokeLinecap="round" opacity={0.7} />}
    </g>
  );
};
export const waveY = (x: number, t: number, y: number, amp: number, wl: number, speed: number, ph = 0) =>
  y + amp * Math.sin((x / wl) * Math.PI * 2 + t * speed + ph) + amp * 0.38 * Math.sin((x / wl) * Math.PI * 3.3 - t * speed * 0.7 + ph * 2);

export const Rain: React.FC<{ t: number; n?: number; k?: number; seed?: number }> = ({ t, n = 120, k = 1, seed = 4 }) => {
  const R = rng(seed);
  return (
    <g opacity={k} stroke="#b9c6ff" strokeWidth={2.2} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const sp = 1400 + R() * 600;
        const x0 = R() * (W + 400);
        const y = ((R() * H + t * sp) % (H + 100)) - 100;
        const x = x0 - y * 0.35 - 100;
        return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 40} opacity={0.25 + R() * 0.35} />;
      })}
    </g>
  );
};

export const Cloud: React.FC<{ x: number; y: number; s?: number; color: string; shade?: string; seed?: number }> = ({ x, y, s = 1, color, shade, seed = 1 }) => {
  const R = rng(seed);
  const puffs = Array.from({ length: 6 }, (_, i) => ({ dx: (i - 2.5) * 70 + (R() - 0.5) * 30, dy: -Math.sin(((i + 0.5) / 6) * Math.PI) * (40 + R() * 40), rr: 55 + R() * 45 }));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {shade && puffs.map((p, i) => <circle key={`s${i}`} cx={p.dx + 8} cy={p.dy + 14} r={p.rr} fill={shade} />)}
      {puffs.map((p, i) => (
        <circle key={i} cx={p.dx} cy={p.dy} r={p.rr} fill={color} />
      ))}
      <rect x={-230} y={-10} width={460} height={60} rx={30} fill={color} />
    </g>
  );
};

export const Gull: React.FC<{ x: number; y: number; s?: number; t: number; color?: string }> = ({ x, y, s = 1, t, color = "#fff8ec" }) => {
  const f = Math.sin(t * 9) * 12;
  return <path d={`M${x - 22 * s},${y - f * s * 0.4} Q${x - 10 * s},${y - 10 * s - f * s * 0.3} ${x},${y} Q${x + 10 * s},${y - 10 * s - f * s * 0.3} ${x + 22 * s},${y - f * s * 0.4}`} fill="none" stroke={color} strokeWidth={4 * s} strokeLinecap="round" strokeLinejoin="round" />;
};

export const Palm: React.FC<{ x: number; base: number; h: number; t: number; color: string; lean?: number }> = ({ x, base, h, t, color, lean = 0.15 }) => {
  const tx = x + h * lean;
  const ty = base - h;
  const sway = Math.sin(t * 1.3 + x) * 4;
  return (
    <g>
      <path d={`M${x - 7},${base} Q${x + h * lean * 0.3},${base - h * 0.5} ${tx - 4},${ty} L${tx + 4},${ty} Q${x + h * lean * 0.3 + 10},${base - h * 0.5} ${x + 7},${base} Z`} fill={color} />
      {[-150, -110, -60, -20, 25, 60].map((a, i) => {
        const ang = ((a + sway) * Math.PI) / 180;
        const L = h * (0.45 + (i % 2) * 0.1);
        const ex = tx + Math.cos(ang) * L;
        const ey = ty + Math.sin(ang) * L * 0.6 + L * 0.25;
        const cx = tx + Math.cos(ang) * L * 0.5;
        const cy = ty + Math.sin(ang) * L * 0.5 - L * 0.12;
        return <path key={i} d={`M${tx},${ty} Q${cx},${cy - 14} ${ex},${ey} Q${cx},${cy + 8} ${tx},${ty + 6} Z`} fill={color} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- fire
export const flamePath = (cx: number, base: number, w: number, h: number, t: number, seed: number, tongues = 4) => {
  const pts: [number, number][] = [[cx - w / 2, base]];
  for (let i = 0; i < tongues; i++) {
    const u = (i + 0.5) / tongues;
    const hx = cx - w / 2 + u * w + nz(t * 1.3, seed + i) * w * 0.08;
    const hh = h * (0.45 + 0.55 * Math.sin(u * Math.PI)) * (0.8 + 0.25 * nz(t * 2.2, seed * 3 + i));
    pts.push([hx + nz(t, seed + i * 2) * w * 0.05, base - hh]);
    if (i < tongues - 1) pts.push([cx - w / 2 + (u + 0.5 / tongues) * w, base - hh * 0.35]);
  }
  pts.push([cx + w / 2, base]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    d += ` Q${(px + x) / 2 + (y < py ? -w * 0.03 : w * 0.03)},${Math.min(py, y) + Math.abs(py - y) * 0.15} ${x},${y}`;
  }
  return d + " Z";
};
export const Flame: React.FC<{ x: number; base: number; w: number; h: number; t: number; seed?: number; k?: number }> = ({ x, base, w, h, t, seed = 1, k = 1 }) => {
  if (k <= 0.001) return null;
  return (
    <g>
      <path d={flamePath(x, base, w, h * k, t, seed, 5)} fill={P.f0} />
      <path d={flamePath(x, base, w * 0.72, h * k * 0.72, t + 0.3, seed + 7, 4)} fill={P.f1} />
      <path d={flamePath(x, base, w * 0.42, h * k * 0.42, t + 0.6, seed + 13, 3)} fill={P.f2} />
    </g>
  );
};

// ---------------------------------------------------------------- people (original chunky characters)
export type PersonProps = {
  x: number;
  y: number;
  s?: number;
  id?: string;
  t?: number;
  skin?: string;
  cloth?: string;
  cloth2?: string;
  hair?: Hair;
  hairColor?: string;
  armL?: number; // degrees, 0 = hanging down, 90 = forward
  armR?: number;
  elbowL?: number;
  elbowR?: number;
  face?: 1 | -1;
  mood?: Mood;
  bob?: number;
  walk?: number; // walk phase (radians); undefined = standing
  beard?: boolean;
  dress?: boolean;
  shawl?: string;
  turn?: number;
  age?: "child" | "adult" | "elder";
  rim?: string;
};
/** scene-scale wrapper around the character rig (~110 units tall at s = 1) */
export const Person: React.FC<PersonProps> = ({ x, y, s = 1, id, t, walk, ...rest }) => (
  <Character id={id ?? `p${Math.round(x * 7 + y * 13)}_${Math.round(s * 100)}_${(rest.cloth ?? "").slice(1)}`} x={x} y={y} s={s * 0.58} t={t ?? (walk !== undefined ? walk / 6 : 0)} walk={walk} {...rest} />
);

// ---------------------------------------------------------------- typography
/** rounded label pill (map / place / date labels) that pops in */
export const Pill: React.FC<{ t: number; at: number; out?: number; x: number; y: number; text: string; sub?: string; color?: string; size?: number; anchor?: "center" | "left" | "right"; pointer?: boolean }> = ({ t, at, out = 1e9, x, y, text, sub, color = P.pill, size = 30, anchor = "center", pointer = false }) => {
  if (t < at || t > out + 0.3) return null;
  const p = spr(t, at, 11, 0.55);
  const o = clamp(p * 3) * (1 - r(t, out, out + 0.25));
  const tx = anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0";
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(${tx}, -100%) scale(${clamp(p, 0, 1.25)})`, transformOrigin: "50% 100%", opacity: o, textAlign: "center" }}>
      <div style={{ background: color, borderRadius: size, padding: `${size * 0.22}px ${size * 0.7}px`, boxShadow: "0 6px 0 rgba(20,10,40,0.25)" }}>
        <div style={{ fontFamily: PILL, fontWeight: 800, fontSize: size, color: "#fff", whiteSpace: "nowrap", lineHeight: 1.15 }}>{text}</div>
        {sub && <div style={{ fontFamily: PILL, fontWeight: 700, fontSize: size * 0.58, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      {pointer && <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: `${size * 0.35}px solid transparent`, borderRight: `${size * 0.35}px solid transparent`, borderTop: `${size * 0.4}px solid ${color}` }} />}
    </div>
  );
};

/** short storytelling caption: words pop up one by one */
export const Caption: React.FC<{ t: number; at: number; out?: number; text: string; y?: number; size?: number; color?: string }> = ({ t, at, out = 1e9, text, y = 1440, size = 60, color = "#ffffff" }) => {
  if (t < at || t > out + 0.4) return null;
  const o = 1 - r(t, out, out + 0.3);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, transform: "translateY(-50%)", textAlign: "center", opacity: o }}>
      <div style={{ display: "inline-block", maxWidth: W - 120, padding: `${size * 0.14}px ${size * 0.45}px ${size * 0.2}px`, borderRadius: size * 0.5, lineHeight: 1.25, background: `rgba(16,8,36,${0.42 * r(t, at, at + 0.3)})` }}>
      {text.split(" ").map((w, i) => {
        const p = spr(t, at + i * 0.06, 12, 0.6);
        return (
          <span key={i} style={{ display: "inline-block", fontFamily: CAP, fontWeight: 600, fontSize: size, color, marginRight: "0.26em", opacity: clamp(p * 2), transform: `translateY(${(1 - clamp(p)) * 22}px) scale(${lerp(0.8, 1, clamp(p))})`, textShadow: "0 4px 0 rgba(20,10,40,0.4), 0 0 24px rgba(20,10,40,0.35)" }}>
            {w}
          </span>
        );
      })}
      </div>
    </div>
  );
};

/** dark chapter card (vertical): small kicker, glowing condensed title, progress bar */
export const ChapterCard: React.FC<{ t: number; at: number; kicker: string; lines: string[]; bar: [number, number]; left: string; right: string; size?: number }> = ({ t, at, kicker, lines, bar, left, right, size = 150 }) => {
  const R = rng(17);
  const k = r(t, at + 0.1, at + 0.6);
  const fill = lerp(bar[0], bar[1], r(t, at + 0.4, at + 1.8, EASE));
  const top = 760 - lines.length * size * 0.46;
  return (
    <AbsoluteFill style={{ background: "#100a22" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={R() * W + Math.sin(t * 0.3 + i) * 20} cy={R() * H} r={120 + R() * 220} fill="#1b1238" opacity={0.7} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 70, textAlign: "center", fontFamily: CAP, fontWeight: 500, fontSize: 46, color: "#d98ac8", opacity: k, transform: `translateY(${(1 - k) * 12}px)` }}>{kicker}</div>
      {lines.map((ln, i) => {
        const p = r(t, at + 0.25 + i * 0.15, at + 0.95 + i * 0.15, EASE);
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: top + i * size * 0.92, textAlign: "center", fontFamily: TITLE, fontWeight: 700, fontSize: size, letterSpacing: "0.02em", color: "#ffdcb0", opacity: p, filter: `blur(${(1 - p) * 8}px)`, textShadow: `0 0 30px rgba(255,140,60,${0.75 * p}), 0 0 80px rgba(255,90,40,${0.45 * p})`, lineHeight: 1 }}>
            {ln}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 140, width: W - 280, top: top + lines.length * size * 0.92 + 70, height: 12, borderRadius: 6, background: "#2a2050", opacity: k }}>
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${P.f1}, ${P.teal})` }} />
        <div style={{ position: "absolute", left: `${fill * 100}%`, top: -8, width: 28, height: 28, marginLeft: -14, borderRadius: 14, background: P.f2, boxShadow: `0 0 18px ${P.f1}` }} />
        <div style={{ position: "absolute", left: 0, top: 26, fontFamily: PILL, fontWeight: 800, fontSize: 28, color: "#b9a8e0" }}>{left}</div>
        <div style={{ position: "absolute", right: 0, top: 26, fontFamily: PILL, fontWeight: 800, fontSize: 28, color: "#b9a8e0" }}>{right}</div>
      </div>
    </AbsoluteFill>
  );
};

/** circular vignette frame (white rim), content drawn in local coords centred on 0,0 */
export const Vignette: React.FC<{ id: string; x: number; y: number; r: number; k: number; bg: string; rim?: string; children: React.ReactNode }> = ({ id, x, y, r: rad, k, bg, rim = "#fff8ea", children }) => {
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <defs>
        <clipPath id={id}>
          <circle r={rad} />
        </clipPath>
      </defs>
      <circle r={rad + 14} fill="#000" opacity={0.18} cy={10} />
      <circle r={rad + 12} fill={rim} />
      <g clipPath={`url(#${id})`}>
        <rect x={-rad} y={-rad} width={rad * 2} height={rad * 2} fill={bg} />
        {children}
      </g>
    </g>
  );
};
