import React from "react";
import { P } from "../data/style";

// Original character rig: jointed limbs, three-quarter heads, expressive eyes/brows/mouths,
// hair masses, layered clothing with folds and trims, two-tone shading and a rim light.
// Local space: feet at (0,0), ~200 units tall. Light comes from the upper left (or `light`).

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (v: number[]) => "#" + v.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
export const shade = (c: string, k = 0.22) => toHex(hex(c).map((v) => v * (1 - k)));
export const tint = (c: string, k = 0.25) => toHex(hex(c).map((v) => v + (255 - v) * k));
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * k));
};

export type Mood = "happy" | "joy" | "worried" | "neutral" | "wow" | "determined" | "sad";
export type Hair = "short" | "long" | "bun" | "curly" | "wrap" | "bald" | "cap";
export type CharProps = {
  id: string;
  x: number;
  y: number;
  s?: number;
  skin?: string;
  cloth?: string;
  cloth2?: string; // trim / belt / headwear
  hair?: Hair;
  hairColor?: string;
  beard?: boolean;
  dress?: boolean; // long garment to the ankles
  shawl?: string; // optional shawl draped over one shoulder
  face?: 1 | -1; // facing direction
  turn?: number; // 0 = profile-ish three-quarter, 1 = frontal
  mood?: Mood;
  // arms: shoulder angle in degrees (0 = hanging, 90 = forward, 180 = up), elbow bend in degrees
  armL?: number;
  armR?: number;
  elbowL?: number;
  elbowR?: number;
  walk?: number; // walk-cycle phase (radians); undefined = standing
  bob?: number;
  t?: number; // time, for blinking
  rim?: string; // rim-light colour (environment)
  age?: "child" | "adult" | "elder";
};

// tapered limb from (x0,y0) to (x1,y1), widths w0 → w1, rounded ends
const limb = (x0: number, y0: number, x1: number, y1: number, w0: number, w1: number) => {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  const p = (x: number, y: number, w: number, s: number) => `${(x + nx * w * s).toFixed(1)},${(y + ny * w * s).toFixed(1)}`;
  return `M${p(x0, y0, w0 / 2, 1)} L${p(x1, y1, w1 / 2, 1)} A${w1 / 2},${w1 / 2} 0 0 1 ${p(x1, y1, w1 / 2, -1)} L${p(x0, y0, w0 / 2, -1)} A${w0 / 2},${w0 / 2} 0 0 1 ${p(x0, y0, w0 / 2, 1)} Z`;
};
const rad = (d: number) => (d * Math.PI) / 180;

export const Character: React.FC<CharProps> = (props) => {
  const {
    id,
    x,
    y,
    s = 1,
    skin = P.skin[0],
    cloth = P.cloth.blue,
    cloth2 = P.cloth.gold,
    hair = "short",
    hairColor = P.hair,
    beard = false,
    dress = false,
    shawl,
    face = 1,
    turn = 0.35,
    mood = "neutral",
    armL = 8,
    armR = -8,
    elbowL,
    elbowR,
    walk,
    bob = 0,
    t = 0,
    rim = "#fff2d6",
    age = "adult",
  } = props;
  const f = face;
  const skinS = shade(skin, 0.2);
  const skinD = shade(skin, 0.35);
  const clothS = shade(cloth, 0.22);
  const hairS = tint(hairColor, 0.12);
  const kid = age === "child";
  const elder = age === "elder";

  // ---- skeleton -------------------------------------------------------
  const ph = walk ?? 0;
  const walking = walk !== undefined;
  const stride = walking ? Math.sin(ph) : 0;
  const lift = walking ? Math.abs(Math.cos(ph)) * 4 : 0;
  const hipY = kid ? -54 : -66;
  const shY = kid ? -104 : -126;
  const headY = kid ? -138 : -166;
  const headR = kid ? 30 : 30;
  const legLen = (hipY * -1 - 6) / 2;
  const leg = (side: number) => {
    const sw = walking ? stride * side * 26 : side * 3;
    const knee = walking ? Math.max(0, Math.sin(ph + (side > 0 ? 0 : Math.PI))) * 30 + 6 : 4;
    const hx = side * 9;
    const kx = hx + Math.sin(rad(sw)) * legLen * f;
    const ky = hipY + Math.cos(rad(sw)) * legLen;
    const a2 = sw - knee;
    const ax = kx + Math.sin(rad(a2)) * legLen * f;
    const ay = Math.min(-4, ky + Math.cos(rad(a2)) * legLen);
    return { hx, hy: hipY, kx, ky, ax, ay };
  };
  const arm = (side: number, ang: number, bend: number | undefined) => {
    const swing = walking ? -stride * side * 22 : 0;
    const a = ang + swing;
    const b = bend ?? (a > 60 ? 25 : 12);
    const L1 = kid ? 22 : 30;
    const L2 = kid ? 20 : 28;
    const sx = side * (kid ? 16 : 20) * (0.7 + 0.3 * turn) + (side === f ? 0 : -f * 3);
    const sy = shY + 6;
    const ex = sx + Math.sin(rad(a)) * L1 * f;
    const ey = sy + Math.cos(rad(a)) * L1;
    const a2 = a + b;
    const hx = ex + Math.sin(rad(a2)) * L2 * f;
    const hy = ey + Math.cos(rad(a2)) * L2;
    return { sx, sy, ex, ey, hx, hy };
  };
  // the arm on the far side (away from the viewer) is drawn behind the body
  const far = -f;
  const near = f;
  const armFar = arm(far, far === -1 ? armL : armR, far === -1 ? elbowL : elbowR);
  const armNear = arm(near, near === -1 ? armL : armR, near === -1 ? elbowL : elbowR);
  const legFar = leg(far);
  const legNear = leg(near);

  // ---- face geometry --------------------------------------------------
  const fo = (1 - turn) * 11 * f; // features shift toward the facing side
  const eyeY = headY + 2;
  const eyeSep = 11 + turn * 3;
  const eNear = { x: fo + eyeSep * 0.5 * f + 2 * f, s: 1 };
  const eFar = { x: fo - eyeSep * 0.5 * f - 1 * f, s: 0.82 + 0.18 * turn };
  const blinkPh = (t * 0.37 + (id.length % 7) * 0.13) % 1;
  const blink = blinkPh > 0.965 ? 0.12 : 1;
  const lidByMood: Record<Mood, number> = { happy: 0.25, joy: 0.45, worried: 0.15, neutral: 0.22, wow: 0, determined: 0.38, sad: 0.35 };
  const browByMood: Record<Mood, [number, number]> = {
    // [lift, tilt] — tilt > 0 raises the inner ends (worried), < 0 lowers them (determined)
    happy: [2, 0],
    joy: [4, 0.1],
    worried: [3, 0.55],
    neutral: [0, 0],
    wow: [7, 0.15],
    determined: [-1, -0.5],
    sad: [1, 0.45],
  };
  const Eye: React.FC<{ cx: number; k: number; inner: number }> = ({ cx, k, inner }) => {
    const rx = 5.6 * k;
    const ry = 6.8 * blink;
    const lid = lidByMood[mood];
    const [lift, tilt] = browByMood[mood];
    const look = 1.6 * f;
    const by = eyeY - 11 - lift;
    const bw = 8 * k;
    return (
      <g>
        {mood === "joy" ? (
          <path d={`M${cx - rx},${eyeY + 1} Q${cx},${eyeY - 7} ${cx + rx},${eyeY + 1}`} fill="none" stroke={P.ink} strokeWidth={2.8} strokeLinecap="round" />
        ) : (
          <g>
            <ellipse cx={cx} cy={eyeY} rx={rx} ry={ry} fill="#fffaf2" />
            {blink > 0.5 && (
              <>
                <ellipse cx={cx + look} cy={eyeY + 0.8} rx={3.6 * k} ry={4.2} fill="#2a1830" />
                <circle cx={cx + look + 1.2} cy={eyeY - 1.2} r={1.3} fill="#ffffff" />
              </>
            )}
            {/* upper lid */}
            <path d={`M${cx - rx - 1},${eyeY - ry * (1 - lid * 1.4) + 0.5} Q${cx},${eyeY - ry - 1.5 + lid * ry * 1.2} ${cx + rx + 1},${eyeY - ry * (1 - lid * 1.4) + 0.5}`} fill="none" stroke={P.ink} strokeWidth={2.4} strokeLinecap="round" />
            {lid > 0.2 && <path d={`M${cx - rx},${eyeY - ry + 0.5} Q${cx},${eyeY - ry - 1.5} ${cx + rx},${eyeY - ry + 0.5} L${cx + rx},${eyeY - ry * (1 - lid * 1.4) + 0.5} Q${cx},${eyeY - ry - 1.5 + lid * ry * 1.2} ${cx - rx},${eyeY - ry * (1 - lid * 1.4) + 0.5} Z`} fill={skinS} />}
          </g>
        )}
        {/* brow */}
        <path d={`M${cx - bw * inner},${by - tilt * 4} Q${cx},${by - 2.5} ${cx + bw * inner},${by + tilt * 4 * 0}`} fill="none" stroke={elder ? "#d8d0c8" : hairColor} strokeWidth={3.4} strokeLinecap="round" transform={`rotate(${tilt * 14 * inner * -1} ${cx} ${by})`} />
      </g>
    );
  };
  const mouthX = fo + 3 * f;
  const mouthY = headY + 17;
  const Mouth = () => {
    switch (mood) {
      case "joy":
        return (
          <g>
            <path d={`M${mouthX - 8},${mouthY - 2} Q${mouthX},${mouthY - 1} ${mouthX + 8},${mouthY - 2} Q${mouthX + 6},${mouthY + 10} ${mouthX},${mouthY + 10} Q${mouthX - 6},${mouthY + 10} ${mouthX - 8},${mouthY - 2} Z`} fill="#5a1a2a" />
            <path d={`M${mouthX - 4},${mouthY + 7} Q${mouthX},${mouthY + 4} ${mouthX + 4},${mouthY + 7} Q${mouthX},${mouthY + 10} ${mouthX - 4},${mouthY + 7} Z`} fill="#e86a6a" />
            <path d={`M${mouthX - 7},${mouthY - 1.5} L${mouthX + 7},${mouthY - 1.5} L${mouthX + 6},${mouthY + 1.5} L${mouthX - 6},${mouthY + 1.5} Z`} fill="#fffaf2" />
          </g>
        );
      case "happy":
        return <path d={`M${mouthX - 7},${mouthY} Q${mouthX},${mouthY + 7} ${mouthX + 7},${mouthY}`} fill="none" stroke="#5a1a2a" strokeWidth={2.6} strokeLinecap="round" />;
      case "wow":
        return <ellipse cx={mouthX} cy={mouthY + 3} rx={4} ry={5.5} fill="#5a1a2a" />;
      case "worried":
        return <path d={`M${mouthX - 7},${mouthY + 3} Q${mouthX - 3},${mouthY - 1} ${mouthX},${mouthY + 2} Q${mouthX + 3},${mouthY + 4} ${mouthX + 7},${mouthY}`} fill="none" stroke="#5a1a2a" strokeWidth={2.4} strokeLinecap="round" />;
      case "sad":
        return <path d={`M${mouthX - 6},${mouthY + 4} Q${mouthX},${mouthY - 2} ${mouthX + 6},${mouthY + 4}`} fill="none" stroke="#5a1a2a" strokeWidth={2.4} strokeLinecap="round" />;
      case "determined":
        return <path d={`M${mouthX - 6},${mouthY + 2} L${mouthX + 5},${mouthY + 1} L${mouthX + 7},${mouthY - 1}`} fill="none" stroke="#5a1a2a" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />;
      default:
        return <path d={`M${mouthX - 5},${mouthY + 1} Q${mouthX},${mouthY + 3} ${mouthX + 5},${mouthY + 1}`} fill="none" stroke="#5a1a2a" strokeWidth={2.4} strokeLinecap="round" />;
    }
  };

  // ---- pieces ---------------------------------------------------------
  const Leg = ({ L, back }: { L: ReturnType<typeof leg>; back: boolean }) => {
    const col = back ? skinS : skin;
    return (
      <g>
        <path d={limb(L.hx, L.hy, L.kx, L.ky, 13, 10)} fill={col} />
        <path d={limb(L.kx, L.ky, L.ax, L.ay, 10, 8)} fill={col} />
        <circle cx={L.hx} cy={L.hy} r={6.5} fill={col} />
        <circle cx={L.kx} cy={L.ky} r={5.2} fill={col} />
        <circle cx={L.ax} cy={L.ay} r={4.2} fill={col} />
        {/* sandal / shoe */}
        <path d={`M${L.ax - 6 * f},${L.ay - 3} Q${L.ax + 4 * f},${L.ay - 6} ${L.ax + 14 * f},${L.ay - 1} Q${L.ax + 16 * f},${L.ay + 3} ${L.ax + 10 * f},${L.ay + 4} L${L.ax - 6 * f},${L.ay + 4} Z`} fill={back ? "#4a2a1c" : "#6b3a24"} />
      </g>
    );
  };
  const Arm = ({ A, back }: { A: ReturnType<typeof arm>; back: boolean }) => {
    const col = back ? skinS : skin;
    const sleeve = back ? shade(clothS, 0.1) : cloth;
    return (
      <g>
        <path d={limb(A.sx, A.sy, A.ex, A.ey, 13, 10)} fill={col} />
        <path d={limb(A.ex, A.ey, A.hx, A.hy, 10, 8)} fill={col} />
        <circle cx={A.sx} cy={A.sy} r={6.5} fill={col} />
        <circle cx={A.ex} cy={A.ey} r={5.2} fill={col} />
        {/* short sleeve */}
        <path d={limb(A.sx, A.sy, A.sx + (A.ex - A.sx) * 0.45, A.sy + (A.ey - A.sy) * 0.45, 16, 14)} fill={sleeve} />
        {/* hand: palm + thumb */}
        <circle cx={A.hx} cy={A.hy} r={6.2} fill={col} />
        <ellipse cx={A.hx + 4 * f} cy={A.hy - 3} rx={2.6} ry={3.6} fill={col} transform={`rotate(${30 * f} ${A.hx + 4 * f} ${A.hy - 3})`} />
      </g>
    );
  };

  // torso / garment silhouette
  const sw = kid ? 18 : 24; // half shoulder width
  const ww = kid ? 15 : 18; // half waist
  const hemY = dress ? -10 : kid ? -40 : -48;
  const hemW = dress ? 30 : kid ? 21 : 26;
  const flare = walking ? stride * 3 : 0;
  const garment = `M${-sw},${shY + 4} Q${-sw - 2},${shY - 4} ${-sw + 8},${shY - 6} L${sw - 8},${shY - 6} Q${sw + 2},${shY - 4} ${sw},${shY + 4} L${ww + 2},${hipY + 6} L${hemW + flare},${hemY} Q0,${hemY + 6} ${-hemW + flare},${hemY} L${-ww - 2},${hipY + 6} Z`;
  const garmentShade = `M${4 * -f},${shY - 6} L${(sw - 8) * -f},${shY - 6} Q${(sw + 2) * -f},${shY - 4} ${sw * -f},${shY + 4} L${(ww + 2) * -f},${hipY + 6} L${(hemW + flare * -f) * -f},${hemY} Q${-6 * f * -1},${hemY + 5} ${8 * -f},${hemY + 4} Q${2 * -f},${hipY} ${4 * -f},${shY - 6} Z`;
  const beltY = hipY + 2;

  const HairBack = () => {
    if (hair === "long")
      return <path d={`M${-headR - 4},${headY - 6} Q${-headR - 10},${headY + 40} ${-headR + 2},${headY + 62} L${headR - 2},${headY + 62} Q${headR + 10},${headY + 40} ${headR + 4},${headY - 6} Z`} fill={hairColor} />;
    if (hair === "bun") return <circle cx={-f * 20} cy={headY - 30} r={14} fill={hairColor} />;
    if (hair === "wrap")
      return (
        <g fill={cloth2}>
          <path d={`M${-f * 24},${headY - 8} Q${-f * 44},${headY + 6} ${-f * 40},${headY + 30} L${-f * 30},${headY + 26} Q${-f * 32},${headY + 8} ${-f * 18},${headY - 2} Z`} />
        </g>
      );
    return null;
  };
  const HairFront = () => {
    const hc = elder ? "#e2dbd2" : hairColor;
    switch (hair) {
      case "short":
        return (
          <g>
            <path d={`M${-headR - 1},${headY - 2} Q${-headR - 3},${headY - headR - 8} ${0},${headY - headR - 6} Q${headR + 4},${headY - headR - 6} ${headR + 1},${headY - 4} Q${headR - 4},${headY - 18} ${fo + 6 * f},${headY - 20} Q${fo - 8 * f},${headY - 14} ${-headR + 4},${headY - 6} Z`} fill={hc} />
            <path d={`M${-f * headR * 0.6},${headY - headR + 2} Q${0},${headY - headR - 5} ${f * headR * 0.4},${headY - headR}`} fill="none" stroke={hairS} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      case "long":
      case "bun":
        return (
          <g>
            <path d={`M${-headR - 2},${headY + 4} Q${-headR - 4},${headY - headR - 8} ${0},${headY - headR - 6} Q${headR + 4},${headY - headR - 8} ${headR + 2},${headY + 4} Q${headR - 2},${headY - 14} ${fo + 4 * f},${headY - 17} Q${fo - 10 * f},${headY - 20} ${-headR + 2},${headY - 4} Z`} fill={hc} />
            <path d={`M${-f * headR * 0.5},${headY - headR + 1} Q${f * 2},${headY - headR - 5} ${f * headR * 0.5},${headY - headR + 1}`} fill="none" stroke={hairS} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      case "curly":
        return (
          <g fill={hc}>
            {Array.from({ length: 11 }, (_, i) => {
              const a = Math.PI * (1.02 + (i / 10) * 0.96);
              return <circle key={i} cx={Math.cos(a) * (headR + 2)} cy={headY - 4 + Math.sin(a) * (headR + 4)} r={10 + (i % 3) * 2} />;
            })}
            <circle cx={fo * 0.3} cy={headY - headR + 2} r={14} />
          </g>
        );
      case "wrap":
        return (
          <g>
            <path d={`M${-headR - 3},${headY + 2} Q${-headR - 4},${headY - headR - 12} ${0},${headY - headR - 10} Q${headR + 4},${headY - headR - 12} ${headR + 3},${headY + 0} Q${headR - 6},${headY - 16} ${0},${headY - 17} Q${-headR + 4},${headY - 16} ${-headR - 3},${headY + 2} Z`} fill={cloth2} />
            <path d={`M${-headR},${headY - 12} Q0,${headY - 24} ${headR},${headY - 12}`} fill="none" stroke={shade(cloth2, 0.2)} strokeWidth={4} />
            <path d={`M${-headR + 4},${headY - 22} Q0,${headY - 34} ${headR - 4},${headY - 22}`} fill="none" stroke={shade(cloth2, 0.2)} strokeWidth={3} />
          </g>
        );
      case "cap":
        return <path d={`M${-headR - 1},${headY - 6} Q${-headR},${headY - headR - 12} ${0},${headY - headR - 10} Q${headR},${headY - headR - 12} ${headR + 1},${headY - 6} Z`} fill={cloth2} />;
      default:
        return null;
    }
  };

  const lean = walking ? 3 * f : 0;
  return (
    <g transform={`translate(${x} ${y - bob - lift}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-head`}>
          <path d={`M${-headR},${headY - 4} Q${-headR},${headY - headR - 2} 0,${headY - headR - 2} Q${headR},${headY - headR - 2} ${headR},${headY - 4} Q${headR},${headY + 20} ${f * 8 + fo * 0.4},${headY + headR + 2} Q${-f * 2},${headY + headR + 4} ${-headR + 4},${headY + 16} Q${-headR},${headY + 8} ${-headR},${headY - 4} Z`} />
        </clipPath>
        <clipPath id={`${id}-body`}>
          <path d={garment} />
        </clipPath>
      </defs>
      {/* soft ground shadow */}
      <ellipse cx={0} cy={2} rx={34} ry={6} fill="#000" opacity={0.15} />
      <g transform={`rotate(${lean} 0 ${hipY})`}>
        <HairBack />
        <Arm A={armFar} back />
        <Leg L={legFar} back />
        <Leg L={legNear} back={false} />
        {/* garment with folds, shade, trim, belt */}
        <path d={garment} fill={cloth} />
        <g clipPath={`url(#${id}-body)`}>
          <path d={garmentShade} fill={clothS} />
          <path d={`M${-f * 6},${hipY + 10} Q${-f * 4},${(hipY + hemY) / 2} ${-f * 9},${hemY + 2}`} fill="none" stroke={clothS} strokeWidth={3} strokeLinecap="round" />
          <path d={`M${f * 8},${hipY + 12} Q${f * 10},${(hipY + hemY) / 2} ${f * 6},${hemY + 2}`} fill="none" stroke={clothS} strokeWidth={2.5} strokeLinecap="round" />
          <rect x={-60} y={hemY - 7} width={120} height={7} fill={cloth2} opacity={0.95} />
          {/* rim light on the lit edge */}
          <path d={garment} fill="none" stroke={rim} strokeWidth={4} opacity={0.35} transform={`translate(${2 * f} 1)`} />
        </g>
        {/* neckline */}
        <path d={`M${-9},${shY - 6} Q0,${shY + 8} ${9},${shY - 6} Z`} fill={skinS} />
        {/* belt / sash with tied ends */}
        <rect x={-ww - 3} y={beltY - 4} width={(ww + 3) * 2} height={8} rx={3} fill={cloth2} />
        <path d={`M${f * 6},${beltY + 2} L${f * 10},${beltY + 18} L${f * 14},${beltY + 16} L${f * 11},${beltY + 2} Z`} fill={shade(cloth2, 0.15)} />
        {shawl && <path d={`M${f * sw},${shY - 2} Q${f * 4},${shY + 6} ${-f * (ww + 2)},${hipY + 8} L${-f * (ww - 6)},${hipY + 16} Q${f * 8},${shY + 22} ${f * (sw + 2)},${shY + 14} Z`} fill={shawl} />}
        {/* neck */}
        <path d={limb(0, shY - 4, fo * 0.2, headY + headR - 6, 12, 11)} fill={skinS} />
        {/* head: shaded base, lit area clipped */}
        <g clipPath={`url(#${id}-head)`}>
          <rect x={-headR - 4} y={headY - headR - 6} width={headR * 2 + 8} height={headR * 2 + 12} fill={skinS} />
          <ellipse cx={-f * 5} cy={headY - 3} rx={headR * 0.98} ry={headR * 1.02} fill={skin} />
          <ellipse cx={f * headR * 0.95} cy={headY + 4} rx={4} ry={headR} fill={tint(rim, 0)} opacity={0.18} />
        </g>
        {/* ear on the far side */}
        <ellipse cx={-f * (headR - 6) + fo * 0.2} cy={headY + 4} rx={5} ry={7} fill={skinS} />
        <HairFront />
        {beard && (
          <path d={`M${-headR + 6},${headY + 4} Q${-headR + 4},${headY + 30} ${fo * 0.5},${headY + headR + 10} Q${headR - 4},${headY + 30} ${headR - 4},${headY + 4} Q${headR - 10},${headY + 16} ${fo * 0.5},${headY + 20} Q${-headR + 12},${headY + 16} ${-headR + 6},${headY + 4} Z`} fill={elder ? "#e2dbd2" : hairColor} />
        )}
        {/* face */}
        <Eye cx={eFar.x} k={eFar.s} inner={-f} />
        <Eye cx={eNear.x} k={eNear.s} inner={f} />
        <path d={`M${fo + 4 * f},${eyeY + 3} Q${fo + 10 * f},${eyeY + 10} ${fo + 3 * f},${eyeY + 11}`} fill={skinD} opacity={0.75} />
        {!beard && <Mouth />}
        {beard && (mood === "happy" || mood === "joy" || mood === "wow" ? <Mouth /> : <path d={`M${mouthX - 5},${mouthY + 2} Q${mouthX},${mouthY + 4} ${mouthX + 5},${mouthY + 2}`} fill="none" stroke="#5a1a2a" strokeWidth={2.4} strokeLinecap="round" />)}
        <ellipse cx={eNear.x + 3 * f} cy={eyeY + 11} rx={5} ry={3} fill="#ff6a6a" opacity={0.28} />
        {turn > 0.25 && <ellipse cx={eFar.x - 3 * f} cy={eyeY + 11} rx={4} ry={2.6} fill="#ff6a6a" opacity={0.22} />}
        {elder && <path d={`M${eNear.x - 6},${eyeY + 9} q3,2 6,0`} fill="none" stroke={skinD} strokeWidth={1.4} />}
        <Arm A={armNear} back={false} />
      </g>
    </g>
  );
};
