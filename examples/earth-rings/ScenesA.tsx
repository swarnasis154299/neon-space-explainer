import React from "react";
import { AbsoluteFill } from "remotion";
import { N } from "../data/style";
import { H, T, W } from "../data/timeline";
import { cam, Cloud, Glow, Grad, Gull, Palm, Person, Svg } from "../components/Art";
import { shade, tint } from "../components/Character";
import { Card, Earth, ICE_BANDS, RingShadow, IceMoon, NotToScale, Pip, Planet, Ring, SAT_BANDS, Scope, SkyArch, SpaceBg, Tag, Title } from "../components/Space";
import { clamp, EASE, INOUT, lerp, r, rng, spr, track } from "../lib/motion";

type SP = { t: number };

// ================================================================ rooftop (hook + ending)
export const Rooftop: React.FC<{ t: number; s: number; fx: number; fy: number; ghost?: number; kidMood?: "neutral" | "wow" | "happy" | "joy"; look?: number; hop?: number }> = ({ t, s, fx, fy, ghost = 0, kidMood = "neutral", look = 0, hop = 0 }) => {
  const R = rng(21);
  const far = Array.from({ length: 16 }, (_, i) => ({ x: i * 72 - 20, w: 60 + R() * 40, h: 90 + R() * 170 }));
  const mid = Array.from({ length: 9 }, (_, i) => ({ x: i * 130 - 40, w: 100 + R() * 50, h: 160 + R() * 220 }));
  const HZ = 1200;
  const bulbs = Array.from({ length: 11 }, (_, i) => i / 10);
  return (
    <Svg>
      <Grad id="rtSky" stops={[[0, N.sp0], [0.38, "#150a48"], [0.56, "#3a1580"], [0.64, "#a8237e"], [0.68, "#ff4f6e"]]} />
      <g transform={cam(s, fx, fy)}>
        <rect x={-200} y={-200} width={W + 400} height={HZ + 260} fill="url(#rtSky)" />
        <SpaceBg id="rtsp" t={t} top="transparent" bot="transparent" neb={0} drift={0} />
        <Glow id="rtHz" cx={540} cy={HZ} r={900} color="#ff5a7a" o={0.35} mid={0.4} />
        {/* the Moon */}
        <Glow id="rtMg" cx={820} cy={720} r={190} color="#fff3d8" o={0.45} mid={0.3} />
        <Planet id="rtMoon" x={820} y={720} r={62} base="#fff4dc" dark="#c9b8e8" rim="#ffffff" night={0.3}>
          <circle cx={800} cy={705} r={13} fill="#efe0c8" />
          <circle cx={838} cy={738} r={9} fill="#efe0c8" />
        </Planet>
        <g transform={`translate(${((t * 55) % 1600) - 250} ${470 - t * 4})`}>
          <rect x={-14} y={-2} width={28} height={4} rx={2} fill="#2a1458" opacity={0.7} />
          <circle cx={-14} cy={0} r={4} fill="#ff5a7a" opacity={Math.sin(t * 8) > 0 ? 1 : 0.15} />
          <circle cx={14} cy={0} r={3} fill="#fff" opacity={Math.sin(t * 8 + 2) > 0.5 ? 1 : 0.1} />
        </g>
        <SkyArch id="rtGhost" cx={540} cy={HZ + 320} rx={1050} ry={1180} w={0.55} k={ghost} glow={0.6} horizon={HZ} />
        {/* skyline */}
        {far.map((b, i) => (
          <rect key={i} x={b.x - t * 3} y={HZ - b.h} width={b.w} height={b.h + 40} fill="#5a1d8f" />
        ))}
        {mid.map((b, i) => (
          <g key={i}>
            <rect x={b.x - t * 6} y={HZ + 30 - b.h} width={b.w} height={b.h + 60} fill="#381372" />
            {Array.from({ length: 8 }, (_, j) => (R() > 0.55 ? <rect key={j} x={b.x - t * 6 + 14 + (j % 3) * 28} y={HZ + 50 - b.h + Math.floor(j / 3) * 42} width={14} height={20} rx={3} fill="#ffb35c" opacity={0.8} /> : null))}
          </g>
        ))}
        {/* our roof */}
        <rect x={-200} y={1258} width={W + 400} height={60} fill="#7b3fd0" />
        <rect x={-200} y={1258} width={W + 400} height={12} fill="#a875ff" />
        <rect x={-200} y={1318} width={W + 400} height={H} fill="#2a0f5e" />
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 4 }, (_, c) => (
            <g key={`${row}_${c}`}>
              {(row + c) % 3 === 0 && <rect x={40 + c * 260} y={1370 + row * 150} width={230} height={160} rx={30} fill="#ffb35c" opacity={0.12} />}
              <rect x={64 + c * 260} y={1394 + row * 150} width={182} height={112} rx={12} fill="#1c0848" />
              <rect x={70 + c * 260} y={1400 + row * 150} width={170} height={100} rx={10} fill={(row + c) % 3 === 0 ? "#ffb35c" : (row + c) % 3 === 1 ? "#3e1a80" : "#5a2a9e"} />
              {(row + c) % 3 === 0 && <path d={`M${70 + c * 260},${1400 + row * 150} h50 q-10,50 -50,100 Z M${240 + c * 260},${1400 + row * 150} h-50 q10,50 50,100 Z`} fill="#ff7a59" opacity={0.85} />}
              <rect x={153 + c * 260} y={1400 + row * 150} width={4} height={100} fill="#1c0848" opacity={0.6} />
              <rect x={60 + c * 260} y={1498 + row * 150} width={190} height={14} rx={5} fill="#4f24a0" />
              {(row * 4 + c) % 5 === 2 && (
                <g>
                  <rect x={90 + c * 260} y={1478 + row * 150} width={36} height={22} rx={4} fill="#c2407a" />
                  <circle cx={100 + c * 260} cy={1470 + row * 150} r={14} fill="#2fb36a" />
                  <circle cx={116 + c * 260} cy={1466 + row * 150} r={12} fill="#46d16c" />
                </g>
              )}
            </g>
          )),
        )}
        {/* water tank */}
        <g>
          <path d="M120,1262 L150,1120 M260,1262 L230,1120 M190,1262 L190,1120" stroke="#2a0f5e" strokeWidth={10} />
          <rect x={110} y={960} width={160} height={170} rx={26} fill="#8f4ae6" />
          <rect x={110} y={960} width={60} height={170} rx={26} fill="#a874ff" />
          <rect x={110} y={1000} width={160} height={10} fill="#5a24a8" />
          <rect x={110} y={1080} width={160} height={10} fill="#5a24a8" />
          <path d="M100,968 Q190,900 280,968 Z" fill="#5a24a8" />
        </g>
        {/* antenna + string lights */}
        <path d="M980,1262 L980,1000 M950,1040 L1010,1040 M958,1080 L1002,1080" stroke="#2a0f5e" strokeWidth={8} strokeLinecap="round" />
        <circle cx={980} cy={995} r={9} fill={N.pink} opacity={0.6 + 0.4 * Math.sin(t * 5)} />
        <path d="M250,1000 Q620,1130 980,1010" stroke="#2a0f5e" strokeWidth={3} fill="none" />
        {bulbs.map((u, i) => {
          const x = lerp(250, 980, u);
          const y = (1 - u) * (1 - u) * 1000 + 2 * (1 - u) * u * 1130 + u * u * 1010 + 10;
          const tw = 0.7 + 0.3 * Math.sin(t * 3 + i * 1.7);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={22} fill="#ffcf6a" opacity={0.22 * tw} />
              <circle cx={x} cy={y} r={8} fill={i % 3 === 0 ? "#ff8ab8" : "#ffd98a"} />
            </g>
          );
        })}
        {/* characters */}
        <Scope x={720} y={1262} s={1.5} ang={40} />
        <Person id="kidRoof" x={590} y={1262} s={2.5} age="child" face={1} turn={lerp(0.3, 0.7, look)} hair="curly" hairColor="#2a1630" skin="#c9784a" cloth="#ff8a2a" cloth2="#ffd15c" mood={kidMood} armR={lerp(18, 118, look)} elbowR={lerp(12, 0, look)} armL={10} elbowL={8} t={t} rim="#ff9ac0" />
        <Pip x={400} y={1262} s={1.15} t={t} look={[0.6, -0.9]} mood={kidMood === "neutral" ? "happy" : "wow"} hop={hop} />
      </g>
    </Svg>
  );
};

export const S1: React.FC<SP> = ({ t }) => {
  const s = lerp(1.0, 1.07, r(t, 0, 5, INOUT));
  return (
    <AbsoluteFill>
      <Rooftop t={t} s={s} fx={540} fy={1000} look={r(t, 1.4, 2.2)} />
      <Title t={t} at={T.title} out={4.6} small="What if Earth had" big="Rings?" y={230} />
    </AbsoluteFill>
  );
};

// ================================================================ Saturn: ice, width, thinness
const SaturnBody: React.FC<{ cx: number; cy: number; R: number; rot: number; t: number }> = ({ cx, cy, R, rot, t }) => (
  <Planet id="sat" x={cx} y={cy} r={R} base={N.sat0} dark={N.satD} rim="#fff2d6" glow="#ffb27a" night={0.4}>
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {[
        [-0.95, 0.25, N.sat1],
        [-0.55, 0.12, N.sat3],
        [-0.3, 0.2, N.sat2],
        [0.05, 0.1, N.sat1],
        [0.22, 0.16, N.sat3],
        [0.5, 0.22, N.sat1],
        [0.78, 0.12, N.sat2],
      ].map(([y, h, c], i) => (
        <rect key={i} x={cx - R * 1.2} y={cy + (y as number) * R + Math.sin(t + i) * 3} width={R * 2.4} height={(h as number) * R} rx={(h as number) * R * 0.5} fill={c as string} opacity={0.85} />
      ))}
      <ellipse cx={cx + R * 0.35 + Math.sin(t * 0.5) * 8} cy={cy + R * 0.42} rx={R * 0.16} ry={R * 0.07} fill="#ff7a4a" />
    </g>
  </Planet>
);

const IceChunks: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const R = rng(44);
  const ch = Array.from({ length: 30 }, () => ({ x: R(), y: R(), s: 10 + Math.pow(R(), 2.2) * 70, sp: 30 + R() * 60, rot: R() * 360, vr: (R() - 0.5) * 60, n: 6 + Math.floor(R() * 3), c: R() }));
  return (
    <g>
      <Glow id="icg" cx={0} cy={-h * 0.2} r={w * 0.7} color="#5b6cff" o={0.35} mid={0.5} />
      {ch
        .sort((a, b) => a.s - b.s)
        .map((c, i) => {
          const x = ((((c.x * (w + 200) - t * c.sp * (c.s / 50)) % (w + 200)) + (w + 200)) % (w + 200)) - w / 2 - 100;
          const y = (c.y - 0.5) * h + Math.sin(t + i) * 6;
          const Rr = rng(i + 3);
          const pts = Array.from({ length: c.n }, (_, k) => {
            const a = (k / c.n) * Math.PI * 2;
            const rr = c.s * (0.75 + Rr() * 0.3);
            return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
          }).join(" ");
          const col = c.c > 0.7 ? N.ice4 : c.c > 0.35 ? N.ice1 : "#ffffff";
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${c.rot + t * c.vr})`}>
              <polygon points={pts} fill={col} strokeLinejoin="round" stroke={col} strokeWidth={c.s * 0.35} />
              <polygon points={pts} fill={shade(col, 0.3)} transform={`translate(${c.s * 0.18} ${c.s * 0.2}) scale(0.7)`} opacity={0.7} />
            </g>
          );
        })}
    </g>
  );
};

export const S2: React.FC<SP> = ({ t }) => {
  const cx = 540;
  const cy = 700;
  const R = 300;
  const rot = -14;
  const tilt = lerp(0.3, 0.008, r(t, T.edge, T.edge + 0.7, INOUT));
  const s = track(
    [
      [T.s2, 1.08, 0],
      [T.s2, 0.98, 1.2],
      [T.ruler - 0.05, 0.62, 0.6],
      [T.edge, 1.55, 0.7],
    ],
    t,
  );
  const fxx = lerp(540, 540 + 2.05 * R * Math.cos((rot * Math.PI) / 180), r(t, T.edge, T.edge + 0.7, INOUT));
  const fyy = lerp(cy, cy + 2.05 * R * Math.sin((rot * Math.PI) / 180), r(t, T.edge, T.edge + 0.7, INOUT));
  const rul = r(t, T.ruler + 0.1, T.ruler + 0.6);
  const OUT = 2.45 * R;
  return (
    <AbsoluteFill>
      <Svg>
        <SpaceBg id="s2" t={t} />
        <g transform={cam(s, fxx, fyy, 540, cy)}>
          <Ring id="satb" cx={cx} cy={cy} R={R} tilt={tilt} rot={rot} bands={SAT_BANDS} half="back" />
          <SaturnBody cx={cx} cy={cy} R={R} rot={rot} t={t} />
          <Ring id="satf" cx={cx} cy={cy} R={R} tilt={tilt} rot={rot} bands={SAT_BANDS} half="front" hair="#ffe9c8" />
          {rul > 0 && t < T.edge + 0.1 && (
            <g transform={`rotate(${rot} ${cx} ${cy})`} opacity={1 - r(t, T.edge - 0.1, T.edge + 0.1)}>
              <line x1={cx - OUT * rul} y1={cy + OUT * 0.3 + 70} x2={cx + OUT * rul} y2={cy + OUT * 0.3 + 70} stroke={N.orange} strokeWidth={9} strokeLinecap="round" />
              <line x1={cx - OUT * rul} y1={cy + OUT * 0.3 + 40} x2={cx - OUT * rul} y2={cy + OUT * 0.3 + 100} stroke={N.orange} strokeWidth={9} strokeLinecap="round" />
              <line x1={cx + OUT * rul} y1={cy + OUT * 0.3 + 40} x2={cx + OUT * rul} y2={cy + OUT * 0.3 + 100} stroke={N.orange} strokeWidth={9} strokeLinecap="round" />
              <Tag t={t} at={T.ruler + 0.3} out={T.edge - 0.15} x={cx} y={cy + OUT * 0.3 + 70} stem={20} dir={-1} text="~280,000 km" color={N.orange} size={62} />
            </g>
          )}
        </g>
        <Tag t={t} at={T.s2 + 0.3} out={T.ruler - 0.2} x={540} y={1010} stem={10} dir={-1} text="Saturn" color={N.orange} size={46} />
        <Card id="ice" t={t} at={T.saturnCard} out={T.ruler - 0.2} x={540} y={1210} w={680} h={400} border={N.teal} bg="#120a40" to={[600, 900]}>
          <IceChunks t={t} w={680} h={400} />
        </Card>
        <Tag t={t} at={T.saturnCard + 0.25} out={T.ruler - 0.2} x={540} y={1395} stem={0} dir={-1} text="Water ice" color={N.teal} size={38} />
        <Tag t={t} at={T.edge + 0.6} x={540} y={cy - 8} stem={170} dir={1} text="~10 m thick" color={N.violet} size={56} />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ an icy moon is torn apart → a ring forms
export const S3: React.FC<SP> = ({ t }) => {
  const cx = 540;
  const cy = 820;
  const ER = 150;
  const tilt = lerp(1, 0.3, r(t, T.s4, T.s4 + 1.6, INOUT));
  const rot = lerp(0, -12, r(t, T.s4, T.s4 + 1.6, INOUT));
  const ROCHE = 410;
  const W0 = 0.95; // orbital rate at the shred radius
  const thSh = -0.35 * Math.PI + W0 * (T.shred - T.s3) * 1.15;
  const mApproach = r(t, T.s3, T.shred, (x) => x * (2 - x));
  const rho = lerp(900, 335, mApproach);
  const th = -0.35 * Math.PI + W0 * (t - T.s3) * 1.15;
  const mx = cx + rho * Math.cos(th);
  const my = cy + rho * Math.sin(th);
  const crack = r(t, T.shred - 0.35, T.shred);
  const s = track(
    [
      [T.s3, 0.92, 0],
      [T.s3, 1.0, 2.4],
      [T.s4, 1.12, 1.6],
      [T.upgraded, 1.3, 0.5],
    ],
    t,
  );
  // debris
  const R = rng(77);
  const parts = Array.from({ length: 520 }, (_, i) => ({ u: R(), v: R(), s: 2 + Math.pow(R(), 3) * 9, c: R(), early: i < 70 }));
  const grow = r(t, T.shred, T.s4 + 0.4, (x) => x);
  const arc = t < T.s4 ? lerp(0.08, 1.9, grow) : lerp(1.9, Math.PI * 2, r(t, T.s4, T.s4 + 2.2, INOUT));
  const thc = thSh + W0 * (t - T.shred) * 1.15;
  const radial = r(t, T.shred, T.s4 + 1.8, INOUT);
  const nShow = t < T.s4 ? 70 : Math.round(lerp(70, 520, r(t, T.s4, T.s4 + 1.5)));
  const ringK = r(t, T.s4 + 1.2, T.s4 + 2.8);
  const dots = (front: boolean) =>
    t >= T.shred
      ? parts.slice(0, nShow).map((p, i) => {
          const a = thc + (p.u - 0.5) * arc + (p.v - 0.5) * 0.4 * (1 - radial);
          const rr = lerp(335 + (p.v - 0.5) * 70, ER * (1.42 + p.v * 1.18), radial);
          const x = rr * Math.cos(a);
          const y = rr * Math.sin(a) * tilt;
          const isFront = Math.sin(a) > 0;
          if (isFront !== front && tilt < 0.98) return null;
          if (!front && tilt >= 0.98) return null;
          const col = p.c > 0.7 ? N.ice4 : p.c > 0.3 ? N.ice1 : "#fff";
          return <circle key={i} cx={cx + x} cy={cy + y} r={p.s * (p.early ? 1.5 : 1)} fill={col} opacity={lerp(1, 0.06, ringK)} />;
        })
      : null;
  return (
    <AbsoluteFill>
      <Svg>
        <SpaceBg id="s3" t={t} seed={8} />
        <g transform={cam(s, cx, cy, 540, 860)}>
          <g transform={`rotate(${rot} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={ROCHE} ry={ROCHE * tilt} fill="none" stroke={N.teal} strokeWidth={6} strokeDasharray="22 18" opacity={0.85 * r(t, T.roche - 0.2, T.roche + 0.3) * (1 - r(t, T.s4 + 0.5, T.s4 + 1.2))} />
          </g>
          <Ring id="erb" cx={cx} cy={cy} R={ER} tilt={tilt} rot={rot} bands={ICE_BANDS} half="back" k={ringK} />
          <g transform={`rotate(${rot} ${cx} ${cy})`}>{dots(false)}</g>
          <Earth id="e3" x={cx} y={cy} r={ER} t={t} extra={<RingShadow cx={cx} cy={cy} R={ER} tilt={tilt} rot={rot} bands={ICE_BANDS} k={ringK} />} />
          <Ring id="erf" cx={cx} cy={cy} R={ER} tilt={tilt} rot={rot} bands={ICE_BANDS} half="front" k={ringK} />
          <g transform={`rotate(${rot} ${cx} ${cy})`}>{dots(true)}</g>
          {t < T.shred && (
            <g>
              <IceMoon id="im" x={mx} y={my} r={46} />
              {crack > 0 && (
                <g stroke="#3a2a90" strokeWidth={4} strokeLinecap="round" fill="none" opacity={crack}>
                  <path d={`M${mx - 30},${my - 22} L${mx - 6},${my - 2} L${mx - 14},${my + 20}`} />
                  <path d={`M${mx + 28},${my - 26} L${mx + 6},${my} L${mx + 24},${my + 26}`} />
                </g>
              )}
            </g>
          )}
          {t >= T.shred && t < T.shred + 0.5 && <circle cx={mx} cy={my} r={lerp(20, 160, r(t, T.shred, T.shred + 0.5))} fill="none" stroke="#fff" strokeWidth={lerp(14, 0, r(t, T.shred, T.shred + 0.5))} />}
        </g>
        <NotToScale />
        <Tag t={t} at={T.s3 + 0.25} out={T.s4 - 0.3} x={540} y={860 + ER * s * 0.98} stem={40} dir={-1} text="Earth" color={N.blue} size={42} />
        <Tag t={t} at={T.roche} out={T.shred - 0.1} x={540 + (cx - 540) * s} y={860 - ROCHE * s} stem={70} text="Roche limit" color={N.teal} size={42} />
        <Tag t={t} at={T.s3 + 0.6} out={T.shred - 0.2} x={540 + (mx - cx) * s} y={860 + (my - cy) * s - 50} stem={60} text="Icy moon" color={N.violet} size={40} />
        <Tag t={t} at={T.upgraded} x={540} y={860 - ER * s} stem={90} text="Earth 2.0" color={N.blue} size={50} />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ daytime: the arch across the sky
const Hills: React.FC<{ t: number; HZ: number; cols: string[]; seed?: number }> = ({ HZ, cols, seed = 3 }) => {
  const R = rng(seed);
  return (
    <g>
      {cols.map((c, i) => {
        const y0 = HZ + i * 70;
        let d = `M-100,${H}`;
        const ph = R() * 6;
        for (let x = -100; x <= W + 100; x += 40) d += ` L${x},${y0 - 40 * Math.sin(x / (260 - i * 40) + ph) - 30 * Math.sin(x / 120 + ph * 2) * (i === cols.length - 1 ? 0.3 : 1)}`;
        return <path key={i} d={`${d} L${W + 100},${H} Z`} fill={c} />;
      })}
    </g>
  );
};
const Tree: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-5} y={-30} width={10} height={32} fill={shade(c, 0.5)} />
    <circle cx={0} cy={-52} r={30} fill={c} />
    <circle cx={10} cy={-46} r={20} fill={shade(c, 0.18)} />
  </g>
);

const Grass: React.FC<{ t: number; y: number; n?: number; seed?: number; c: string; c2: string }> = ({ t, y, n = 70, seed = 4, c, c2 }) => {
  const R = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = R() * (W + 200) - 100;
        const h = 26 + R() * 40;
        const sw = Math.sin(t * 2 + x * 0.02) * 7;
        const yy = y + R() * 260;
        return <path key={i} d={`M${x - 7},${yy} Q${x + sw * 0.4},${yy - h * 0.6} ${x + sw},${yy - h} Q${x + sw * 0.2 + 3},${yy - h * 0.5} ${x + 7},${yy} Z`} fill={i % 3 ? c : c2} />;
      })}
      {Array.from({ length: 16 }, (_, i) => {
        const x = R() * W;
        const yy = y + 40 + R() * 220;
        const col = [N.pink, N.gold, "#ffffff", "#b06aff"][i % 4];
        const sw = Math.sin(t * 2 + i) * 4;
        return (
          <g key={`f${i}`} transform={`translate(${x + sw} ${yy})`}>
            <line x1={-sw} y1={30} x2={0} y2={0} stroke={c2} strokeWidth={4} />
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 9} cy={Math.sin((a * Math.PI) / 180) * 9} r={7} fill={col} />
            ))}
            <circle r={6} fill={N.gold} />
          </g>
        );
      })}
    </g>
  );
};

const CLOSE = 22.45;
export const S5: React.FC<SP> = ({ t }) => {
  const HZ = 1130;
  const R = rng(5);
  if (t >= CLOSE) {
    // close-up: the kid's awed face under the arch, Pip pops in
    const k = r(t, CLOSE, T.s6, (x) => x);
    const s = lerp(1.0, 1.06, k);
    return (
      <AbsoluteFill>
        <Svg>
          <Grad id="cSky" stops={[[0, "#1d8cff"], [0.6, "#56cfff"], [1, "#c6f4ff"]]} />
          <g transform={cam(s, 540, 1000)}>
            <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#cSky)" />
            <Glow id="cSun" cx={150} cy={260} r={300} color="#fffbe0" o={0.6} mid={0.25} />
            <g transform={`rotate(-14 540 900)`}>
              <SkyArch id="cArch" cx={540} cy={2300 - k * 40} rx={1700} ry={1900} w={0.5} k={1} glow={1.3} horizon={2600} />
            </g>
            <Cloud x={820 - k * 60} y={640} s={0.9} color="#ffffff" shade="#d6f2ff" seed={7} />
            <path d={`M-200,1500 Q300,1380 700,1460 Q1000,1520 1300,1440 L1300,${H + 200} L-200,${H + 200} Z`} fill="#1fb07e" />
            <Person id="kidClose" x={500} y={1780} s={8.4} age="child" face={1} turn={0.88} hair="curly" hairColor="#2a1630" skin="#c9784a" cloth="#ff8a2a" cloth2="#ffd15c" mood="wow" armR={12} armL={12} t={t} rim="#e8fbff" />
            <Pip x={880} y={1700 - spr(t, CLOSE + 0.8, 10, 0.5) * 380 + 380} s={2.4} t={t} look={[-0.3, -1]} mood="wow" face={-1} />
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const s = lerp(1.22, 1.0, r(t, T.s5, T.s5 + 2.2, INOUT));
  const fy = lerp(1180, 960, r(t, T.s5, T.s5 + 2.2, INOUT));
  return (
    <AbsoluteFill>
      <Svg>
        <Grad id="dSky" stops={[[0, "#1d8cff"], [0.45, "#3fc2ff"], [0.62, "#b6f0ff"]]} />
        <g transform={cam(s, 540, fy, 540, 960)}>
          <rect x={-300} y={-300} width={W + 600} height={HZ + 400} fill="url(#dSky)" />
          <Glow id="dSun" cx={180} cy={300} r={260} color="#fffbe0" o={0.7} mid={0.25} />
          <circle cx={180} cy={300} r={60} fill="#fffbe8" />
          <SkyArch id="dArch" cx={540} cy={HZ + 380} rx={1180} ry={1260} w={0.62} k={1} glow={1.2} horizon={HZ + 40} />
          {/* haze where the arch meets the horizon */}
          <Grad id="dHaze" stops={[[0, "#b6f0ff00"], [1, "#d8f8ff"]]} />
          <rect x={-300} y={HZ - 360} width={W + 600} height={400} fill="url(#dHaze)" opacity={0.85} />
          {[0, 1, 2].map((i) => (
            <Cloud key={i} x={((i * 470 + t * 26) % 1500) - 200} y={520 + i * 190} s={0.55 + i * 0.12} color="#ffffff" shade="#d6f2ff" seed={i + 2} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <Gull key={i} x={700 + i * 46 - (t - T.s5) * 40} y={760 + (i % 2) * 26 + Math.sin(t * 2 + i) * 6} s={0.9} t={t + i * 0.3} color="#1c4f9a" />
          ))}
          <Hills t={t} HZ={HZ} cols={["#3ccf9c", "#1fb07e", "#108a68", "#0b6e58"]} />
          {Array.from({ length: 9 }, (_, i) => (
            <Tree key={i} x={R() * W} y={HZ + 80 + R() * 60} s={0.7 + R() * 0.4} c={i % 2 ? "#17a06a" : "#2fc27a"} />
          ))}
          <Person id="kidDay" x={470} y={1320} s={2.7} age="child" face={1} turn={0.8} hair="curly" hairColor="#2a1630" skin="#c9784a" cloth="#ff8a2a" cloth2="#ffd15c" mood="wow" armR={lerp(18, 118, spr(t, T.s5 + 0.9, 10, 0.6))} elbowR={0} armL={10} t={t} />
          <Pip x={660} y={1322} s={1.2} t={t} look={[0.2, -1]} mood="wow" hop={Math.max(0, Math.sin((t - T.s5 - 1.2) * 7)) * 12 * (t > T.s5 + 1.2 && t < T.s5 + 2.1 ? 1 : 0)} />
          <Grass t={t} y={1420} c="#0f8a64" c2="#0a6e52" />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ split: equator vs poles
const Equator: React.FC<{ t: number }> = ({ t }) => {
  const HZ = 1080;
  return (
    <g>
      <Grad id="eqSky" stops={[[0, "#ff7a59"], [0.35, "#ff9e5e"], [0.56, "#ffd58a"]]} />
      <rect x={-200} y={0} width={W + 400} height={HZ + 20} fill="url(#eqSky)" />
      <Glow id="eqLn" cx={540} cy={500} r={420} color="#fff" o={0.25} mid={0.3} />
      {/* edge-on ring: a thin bright line straight overhead */}
      <line x1={540} y1={-50} x2={540} y2={HZ} stroke="#fff" strokeWidth={22} opacity={0.25} />
      <line x1={540} y1={-50} x2={540} y2={HZ} stroke="#fffdf4" strokeWidth={8} strokeLinecap="round" />
      <circle cx={760} cy={HZ - 120} r={70} fill="#fff1c2" opacity={0.95} />
      <rect x={-200} y={HZ} width={W + 400} height={H} fill="#13a7a8" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={((i * 170 + t * 30) % 1300) - 150} y={HZ + 40 + (i % 4) * 70} width={90} height={8} rx={4} fill="#7ff0e8" opacity={0.6} />
      ))}
      <ellipse cx={330} cy={HZ + 150} rx={330} ry={70} fill="#ffd06a" />
      <ellipse cx={330} cy={HZ + 140} rx={300} ry={48} fill="#ffe29a" />
      <Palm x={250} base={HZ + 130} h={300} t={t} color="#0f6b5a" lean={0.18} />
      <Palm x={420} base={HZ + 140} h={230} t={t + 1} color="#138a6e" lean={-0.12} />
      <rect x={-200} y={HZ + 330} width={W + 400} height={H} fill="#0c7a86" />
      <rect x={-200} y={HZ + 520} width={W + 400} height={H} fill="#085e70" />
    </g>
  );
};
const Poles: React.FC<{ t: number }> = ({ t }) => {
  const HZ = 1080;
  const R = rng(12);
  return (
    <g>
      <Grad id="poSky" stops={[[0, "#20237a"], [0.4, "#3b4fd0"], [0.56, "#9fb4ff"]]} />
      <rect x={-200} y={0} width={W + 400} height={HZ + 20} fill="url(#poSky)" />
      <SpaceBg id="po" t={t} top="transparent" bot="transparent" neb={0} drift={0} seed={31} />
      <SkyArch id="poArch" cx={540} cy={HZ + 880} rx={760} ry={1030} w={0.7} k={0.95} glow={1} horizon={HZ + 10} />
      <Hills t={t} HZ={HZ} cols={["#c9d2ff", "#a6b2ff", "#7d8af0", "#5562d0"]} seed={9} />
      {[300, 470, 690].map((x, i) => (
        <g key={i} transform={`translate(${x} ${HZ + 150 + i * 14}) scale(${0.9 + i * 0.1})`}>
          <rect x={-50} y={-60} width={100} height={60} fill="#4e3aa8" />
          <path d="M-62,-58 L0,-110 L62,-58 Z" fill="#ffffff" />
          <rect x={-12} y={-40} width={24} height={26} rx={4} fill="#ffcf6a" />
        </g>
      ))}
      {Array.from({ length: 50 }, (_, i) => {
        const x = R() * W;
        const y = ((R() * H + t * (60 + R() * 60)) % H);
        return <circle key={i} cx={x + Math.sin(t + i) * 10} cy={y} r={3 + R() * 4} fill="#fff" opacity={0.75} />;
      })}
    </g>
  );
};
export const S6: React.FC<SP> = ({ t }) => {
  const sp = r(t, 27.3, 27.85, INOUT);
  const wL = lerp(W, 530, sp);
  const x0 = lerp(W + 40, 550, sp);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Svg>
        <defs>
          <clipPath id="spL">
            <rect x={0} y={0} width={wL} height={H} />
          </clipPath>
          <clipPath id="spR">
            <rect x={x0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#spL)">
          <g transform={`translate(${wL / 2 - 540} 0) ${cam(lerp(1.06, 1.0, r(t, T.s6, T.s6 + 2.5)), 540, 960)}`}>
            <Equator t={t} />
          </g>
        </g>
        {sp > 0 && (
          <g clipPath="url(#spR)">
            <g transform={`translate(${x0 + 265 - 540} 0)`}>
              <Poles t={t} />
            </g>
          </g>
        )}
        <Tag t={t} at={T.s6 + 0.3} x={wL / 2} y={260} stem={0} text="Equator" color={N.orange} size={44} />
        <Tag t={t} at={27.9} x={x0 + 265} y={260} stem={0} text="Near the poles" color={N.blue} size={40} />
      </Svg>
    </AbsoluteFill>
  );
};
void clamp;
void EASE;
void tint;
