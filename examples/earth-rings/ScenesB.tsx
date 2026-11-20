import React from "react";
import { AbsoluteFill } from "remotion";
import { N } from "../data/style";
import { H, T, W } from "../data/timeline";
import { cam, Cloud, Glow, Grad, Person, shake, Svg, Wave } from "../components/Art";
import { shade } from "../components/Character";
import { Bubble, Card, Earth, ICE_BANDS, NotToScale, Pip, Ring, RingShadow, SkyArch, SpaceBg, Tag } from "../components/Space";
import { clamp, INOUT, lerp, r, rng, spr } from "../lib/motion";
import { Rooftop } from "./ScenesA";

type SP = { t: number };

// ================================================================ night landscape lit by the ring
const NightLand: React.FC<{ t: number; HZ: number; arch: { cx: number; cy: number; rx: number; ry: number } }> = ({ t, HZ, arch }) => {
  const R = rng(19);
  return (
    <g>
      <Grad id="nSky" stops={[[0, N.sp0], [0.35, "#160b50"], [0.55, "#3a1a8a"], [0.6, "#5a2fb0"]]} />
      <rect x={-300} y={-300} width={W + 600} height={HZ + 340} fill="url(#nSky)" />
      <g transform={`rotate(-28 540 500)`}>
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={-200 + i * 190} cy={470 + Math.sin(i * 1.7) * 40} rx={220} ry={90 + (i % 3) * 30} fill={i % 2 ? "#7a4dd8" : "#4a5ad8"} opacity={0.16} />
        ))}
        {Array.from({ length: 240 }, (_, i) => {
          const x = -300 + R() * 1700;
          const y = 470 + (R() + R() + R() - 1.5) * 150;
          return <circle key={`m${i}`} cx={x} cy={y} r={0.6 + R() * 1.6} fill="#fff6e8" opacity={(0.3 + R() * 0.6) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />;
        })}
      </g>
      <SpaceBg id="nsp" t={t} top="transparent" bot="transparent" neb={0} drift={0} seed={14} />
      <Glow id="nAg" cx={arch.cx} cy={arch.cy - arch.ry} r={900} color="#9fb4ff" o={0.25} mid={0.4} />
      <SkyArch id="nArch" cx={arch.cx} cy={arch.cy} rx={arch.rx} ry={arch.ry} w={0.6} k={1} glow={1.4} gap={0} horizon={HZ + 20} />
      {/* far ridge + trees + a cottage, all rim-lit by ringlight */}
      {(() => {
        let d = `M-300,${H}`;
        for (let x = -300; x <= W + 300; x += 40) d += ` L${x},${HZ - 30 * Math.sin(x / 210 + 1) - 18 * Math.sin(x / 70)}`;
        return <path d={`${d} L${W + 300},${H} Z`} fill="#3a2b9a" />;
      })()}
      {Array.from({ length: 14 }, (_, i) => {
        const x = -100 + i * 95 + R() * 40;
        const y = HZ + 60 + R() * 40;
        const s = 0.8 + R() * 0.6;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0,-120 L34,-20 L-34,-20 Z" fill="#241a70" />
            <path d="M0,-120 L-34,-20 L-14,-20 Z" fill="#8f9bff" opacity={0.35} />
            <rect x={-5} y={-22} width={10} height={24} fill="#1a1258" />
          </g>
        );
      })}
      <g transform={`translate(${arch.cx + 300} ${HZ + 150})`}>
        <rect x={-70} y={-90} width={140} height={90} fill="#3d2a9e" />
        <path d="M-88,-86 L0,-150 L88,-86 Z" fill="#5d4fd8" />
        <path d="M-88,-86 L0,-150 L0,-140 L-76,-84 Z" fill="#a9b4ff" opacity={0.6} />
        <rect x={-20} y={-66} width={40} height={36} rx={5} fill="#ffcf6a" />
        <circle cx={0} cy={-48} r={60} fill="#ffcf6a" opacity={0.12} />
      </g>
      {/* hills, top-lit by the ring */}
      {[
        [HZ + 230, "#2c2284", "#9fa9ff"],
        [HZ + 360, "#1d1660", "#7280f0"],
      ].map(([y0, c, rim], i) => {
        let d = `M-300,${H}`;
        for (let x = -300; x <= W + 300; x += 40) d += ` L${x},${(y0 as number) - 50 * Math.sin(x / (420 - i * 90) + i * 2) - 8 * Math.sin(x / 90 + i)}`;
        const top = d.replace(`M-300,${H} L`, "M");
        return (
          <g key={i}>
            <path d={`${d} L${W + 300},${H} Z`} fill={c as string} />
            <path d={top} fill="none" stroke={rim as string} strokeWidth={6} opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

export const S7: React.FC<SP> = ({ t }) => {
  const HZ = 1050;
  const s = lerp(1.0, 1.14, r(t, T.s7, T.s8, INOUT));
  return (
    <AbsoluteFill>
      <Svg>
        <g transform={cam(s, 540, 1000, 540, 980)}>
          <NightLand t={t} HZ={HZ} arch={{ cx: 540, cy: HZ + 200, rx: 1000, ry: 880 }} />
          {/* a sun-glint sliding along the ring */}
          <Person id="kidNight" x={420} y={1330} s={3.2} age="child" face={1} turn={0.75} hair="curly" hairColor="#2a1630" skin="#c9784a" cloth="#ff8a2a" cloth2="#ffd15c" mood="joy" armR={125} armL={125} elbowL={0} elbowR={0} t={t} rim="#c9d4ff" />
          {Array.from({ length: 16 }, (_, i) => {
            const fx = 200 + ((i * 157) % 700) + Math.sin(t * 0.9 + i * 2) * 40;
            const fy = 1150 + ((i * 89) % 260) + Math.cos(t * 1.1 + i) * 30;
            const b = 0.4 + 0.6 * Math.max(0, Math.sin(t * 3 + i * 1.3));
            return (
              <g key={i} opacity={b}>
                <circle cx={fx} cy={fy} r={18} fill="#ffe08a" opacity={0.25} />
                <circle cx={fx} cy={fy} r={5} fill="#fff6c8" />
              </g>
            );
          })}
          <Pip x={650} y={1345} s={1.4} t={t} look={[-0.1, -1]} mood="wow" face={-1} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ the ring's shadow → colder winters
const Snowtown: React.FC<{ t: number }> = ({ t }) => {
  const R = rng(51);
  return (
    <g>
      <rect x={-400} y={-300} width={800} height={600} fill="#2f3aa8" />
      <Glow id="stg" cx={0} cy={-200} r={400} color="#6f83ff" o={0.4} mid={0.4} />
      <path d="M-400,120 Q-200,60 0,110 Q200,150 400,90 L400,300 L-400,300 Z" fill="#c9d2ff" />
      {[-240, -110, 200].map((x, i) => (
        <g key={i} transform={`translate(${x} ${110 - i * 6})`}>
          <rect x={-55} y={-80} width={110} height={80} fill={["#5a3fb8", "#7a3fa6", "#3f4fc0"][i]} />
          <path d="M-70,-76 L0,-140 L70,-76 Z" fill="#fff" />
          <rect x={-14} y={-56} width={28} height={30} rx={5} fill="#ffcf6a" />
        </g>
      ))}
      <Pip x={60} y={190} s={1.25} t={t * 3.5} look={[0, 0.2]} mood="worried" />
      {/* scarf */}
      <path d="M22,128 Q60,140 104,126" stroke={N.pink} strokeWidth={14} strokeLinecap="round" fill="none" />
      {Array.from({ length: 60 }, (_, i) => {
        const x = R() * 800 - 400;
        const y = ((R() * 600 + t * (70 + R() * 60)) % 600) - 300;
        return <circle key={i} cx={x + Math.sin(t * 2 + i) * 12} cy={y} r={3 + R() * 5} fill="#fff" opacity={0.85} />;
      })}
    </g>
  );
};
export const S8: React.FC<SP> = ({ t }) => {
  const ex = 640;
  const ey = 700;
  const ER = 220;
  const ax = -23;
  const sh = r(t, T.s8 + 0.3, T.s8 + 1.2, INOUT);
  return (
    <AbsoluteFill>
      <Svg>
        <SpaceBg id="s8" t={t} seed={23} />
        <g transform={cam(lerp(1.0, 1.06, r(t, T.s8, T.s9, INOUT)), 540, 900)}>
        <Glow id="sun" cx={-120} cy={ey} r={720} color="#ffb020" o={0.6} mid={0.35} />
        <circle cx={-190} cy={ey} r={260} fill="#ffe08a" />
        <circle cx={-190} cy={ey} r={220} fill="#fff4c8" />
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M80,${ey - 330 + i * 150} L${ex - 40},${ey - 230 + i * 110}`} stroke="#ffe08a" strokeWidth={6} strokeDasharray="30 26" strokeDashoffset={-t * 120} opacity={0.35} />
        ))}
        <Ring id="s8b" cx={ex} cy={ey} R={ER} tilt={0.16} rot={ax} bands={ICE_BANDS} half="back" />
        <Earth
          id="e8"
          x={ex}
          y={ey}
          r={ER}
          t={t}
          extra={
            <g transform={`rotate(${ax} ${ex} ${ey})`} opacity={sh}>
              <ellipse cx={ex + 30} cy={ey - ER * 0.5} rx={ER * 1.15} ry={ER * 0.17} fill="#0a0630" opacity={0.6} />
              <ellipse cx={ex + 30} cy={ey - ER * 0.5} rx={ER * 1.15} ry={ER * 0.06} fill="#0a0630" opacity={0.35} transform={`translate(0 ${-ER * 0.14})`} />
            </g>
          }
        />
        <Ring id="s8f" cx={ex} cy={ey} R={ER} tilt={0.16} rot={ax} bands={ICE_BANDS} half="front" />
        <line x1={ex + Math.sin((ax * Math.PI) / 180) * -ER * 1.35} y1={ey - Math.cos((ax * Math.PI) / 180) * ER * 1.35} x2={ex - Math.sin((ax * Math.PI) / 180) * -ER * 1.35} y2={ey + Math.cos((ax * Math.PI) / 180) * ER * 1.35} stroke="#fff" strokeWidth={5} strokeDasharray="14 12" opacity={0.5} />
        </g>
        <Tag t={t} at={T.s8 + 1.0} x={ex + 40} y={ey - ER * 0.55} stem={190} dx={170} text="Ring shadow" color={N.violet} size={44} />
        <Card id="snow" t={t} at={T.winter} x={540} y={1140} w={720} h={380} border={N.blue} bg="#2f3aa8" to={[ex - 20, ey - ER * 0.45]}>
          <Snowtown t={t} />
        </Card>
        <Tag t={t} at={T.winter + 0.25} x={540} y={1325} stem={0} dir={-1} text="Colder winters" color={N.blue} size={40} />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ satellites vs space gravel
const Sat: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <rect x={sd > 0 ? 26 : -86} y={-14} width={60} height={28} rx={4} fill="#2a5bff" />
        <path d={`M${sd > 0 ? 46 : -66},-14 V14 M${sd > 0 ? 66 : -46},-14 V14 M${sd > 0 ? 26 : -86},0 H${sd > 0 ? 86 : -26}`} stroke="#9fc0ff" strokeWidth={2.5} />
        <rect x={sd > 0 ? 18 : -26} y={-3} width={8} height={6} fill="#c9c9e8" />
      </g>
    ))}
    <rect x={-18} y={-22} width={36} height={44} rx={6} fill="#ffc24a" />
    <rect x={-18} y={-22} width={14} height={44} rx={6} fill="#ffdc8a" />
    <path d="M0,-22 L0,-34" stroke="#c9c9e8" strokeWidth={4} />
    <path d="M-12,-40 Q0,-28 12,-40" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
const orbitPt = (cx: number, cy: number, rx: number, ry: number, rot: number, a: number): [number, number] => {
  const x = rx * Math.cos(a);
  const y = ry * Math.sin(a);
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  return [cx + x * c - y * s, cy + x * s + y * c];
};
const Gravel: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const R = rng(66);
  const rocks = Array.from({ length: 26 }, () => ({ y: (R() - 0.5) * 360, sp: 500 + R() * 500, ph: R(), s: 5 + Math.pow(R(), 2) * 18, c: R() }));
  return (
    <g>
      {rocks.map((k, i) => {
        const x = 420 - (((t - t0) * k.sp + k.ph * 900) % 900);
        return <circle key={i} cx={x} cy={k.y} r={k.s} fill={k.c > 0.5 ? N.ice1 : "#9a9ac8"} />;
      })}
    </g>
  );
};
export const S9: React.FC<SP> = ({ t }) => {
  const cx = 540;
  const cy = 760;
  const ER = 160;
  const ringRot = -10;
  const oA = { rx: 470, ry: 190, rot: 28 };
  const oB = { rx: 520, ry: 130, rot: -40 };
  const aA = 0.8 + (t - T.s9) * 0.55;
  const aB = 2.2 + (t - T.s9) * 0.42;
  const pA = orbitPt(cx, cy, oA.rx, oA.ry, oA.rot, aA);
  const pB = orbitPt(cx, cy, oB.rx, oB.ry, oB.rot, aB);
  const front = (a: number) => Math.sin(a) > 0;
  const hitShake = t > T.hit ? Math.max(0, 1 - (t - T.hit) * 2) : 0;
  const orbit = (o: typeof oA, id: string) => <ellipse key={id} cx={cx} cy={cy} rx={o.rx} ry={o.ry} transform={`rotate(${o.rot} ${cx} ${cy})`} fill="none" stroke="#c9b6ff" strokeWidth={4} strokeDasharray="16 14" opacity={0.6} />;
  const hits = [0.25, 0.7, 1.15, 1.6, 2.05];
  return (
    <AbsoluteFill>
      <Svg>
        <SpaceBg id="s9" t={t} seed={41} />
        {orbit(oA, "a")}
        {orbit(oB, "b")}
        {!front(aA) && <Sat x={pA[0]} y={pA[1]} s={0.55} rot={20} />}
        {!front(aB) && <Sat x={pB[0]} y={pB[1]} s={0.55} rot={-30} />}
        <Ring id="s9b" cx={cx} cy={cy} R={ER} tilt={0.3} rot={ringRot} bands={ICE_BANDS} half="back" />
        <Earth id="e9" x={cx} y={cy} r={ER} t={t} extra={<RingShadow cx={cx} cy={cy} R={ER} tilt={0.3} rot={ringRot} bands={ICE_BANDS} />} />
        <Ring id="s9f" cx={cx} cy={cy} R={ER} tilt={0.3} rot={ringRot} bands={ICE_BANDS} half="front" />
        {front(aA) && <Sat x={pA[0]} y={pA[1]} s={0.55} rot={20} />}
        {front(aB) && <Sat x={pB[0]} y={pB[1]} s={0.55} rot={-30} />}
        <NotToScale />
        <Tag t={t} at={T.s9 + 0.4} out={T.hit - 0.2} x={pB[0]} y={pB[1] - 26} stem={60} text="Satellite" color={N.orange} size={40} />
        <g transform={shake(t, hitShake * 0.6)}>
          <Card id="grav" t={t} at={T.hit} x={540} y={1170} w={720} h={400} border={N.orange} bg="#0d0838" to={[pB[0], pB[1] + 20]}>
            <SpaceBg id="gcard" t={t} top="#0d0838" bot="#1c0f5c" neb={0} drift={0} seed={2} />
            <Gravel t={t} t0={T.hit} />
            <Sat x={-40 + Math.sin(t * 30) * 6 * hitShake} y={0} s={2.3} rot={-12 + (t - T.hit) * 14} />
            {hits.map((d, i) => {
              const k = r(t, T.hit + d, T.hit + d + 0.3);
              if (k <= 0 || k >= 1) return null;
              const hx = [-130, 60, -60, 150, -10][i];
              const hy = [-20, 30, 40, -30, -60][i];
              return (
                <g key={i} transform={`translate(${hx} ${hy}) scale(${lerp(0.4, 1.3, k)})`} opacity={1 - k}>
                  <path d="M0,-40 L9,-9 L40,0 L9,9 L0,40 L-9,9 L-40,0 L-9,-9 Z" fill="#fff3b0" />
                  <circle r={12} fill="#fff" />
                </g>
              );
            })}
          </Card>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ shooting stars
export const S10: React.FC<SP> = ({ t }) => {
  const HZ = 1080;
  const R = rng(91);
  const met = Array.from({ length: 18 }, (_, i) => ({ t0: T.s10 + 0.2 + i * 0.26 + R() * 0.2, x: 80 + R() * 920, y: 160 + R() * 520, ang: 110 + R() * 30, len: 160 + R() * 180, big: i === 9 }));
  const s = lerp(1.06, 1.0, r(t, T.s10, T.s11));
  return (
    <AbsoluteFill>
      <Svg>
        <g transform={cam(s, 540, 960)}>
          <NightLand t={t} HZ={HZ} arch={{ cx: 540, cy: HZ + 160, rx: 980, ry: 860 }} />
          {met.map((m, i) => {
            const d = m.big ? 1.0 : 0.6;
            const k = (t - m.t0) / d;
            if (k < 0 || k > 1) return null;
            const a = (m.ang * Math.PI) / 180;
            const L = m.len * (m.big ? 2 : 1);
            const hx = m.x + Math.cos(a) * L * k * 1.6;
            const hy = m.y + Math.sin(a) * L * k * 1.6;
            const tx = hx - Math.cos(a) * L * Math.min(1, k * 3);
            const ty = hy - Math.sin(a) * L * Math.min(1, k * 3);
            const o = Math.sin(k * Math.PI);
            return (
              <g key={i} opacity={o}>
                <defs>
                  <linearGradient id={`mt${i}`} x1={tx} y1={ty} x2={hx} y2={hy} gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#ffd6f0" stopOpacity={0} />
                    <stop offset="1" stopColor="#fffbe8" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <line x1={tx} y1={ty} x2={hx} y2={hy} stroke={`url(#mt${i})`} strokeWidth={m.big ? 12 : 6} strokeLinecap="round" />
                <circle cx={hx} cy={hy} r={m.big ? 14 : 6} fill="#fff" />
                {m.big && <circle cx={hx} cy={hy} r={40} fill="#ffd08a" opacity={0.3} />}
              </g>
            );
          })}
          <Person id="kidMet" x={650} y={1340} s={3.0} age="child" face={-1} turn={0.7} hair="curly" hairColor="#2a1630" skin="#c9784a" cloth="#ff8a2a" cloth2="#ffd15c" mood="wow" armR={118} elbowR={0} armL={10} t={t} rim="#c9d4ff" />
          <Pip x={420} y={1350} s={1.35} t={t} look={[0.3, -1]} mood="happy" point={clamp(spr(t, 47.4, 10, 0.6))} hop={t > 47.5 && t < 48.3 ? Math.abs(Math.sin((t - 47.5) * 8)) * 14 : 0} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ plot twist: the Ordovician ring
const Crinoid: React.FC<{ x: number; y: number; h: number; t: number; c: string }> = ({ x, y, h, t, c }) => {
  const sw = Math.sin(t * 1.2 + x) * 14;
  const tx = x + sw;
  const ty = y - h;
  return (
    <g>
      <path d={`M${x},${y} Q${x + sw * 0.3},${y - h * 0.5} ${tx},${ty}`} stroke={shade(c, 0.3)} strokeWidth={9} fill="none" strokeLinecap="round" />
      {[-70, -40, -10, 20, 50].map((a, i) => {
        const ang = ((a - 90 + sw) * Math.PI) / 180;
        return <path key={i} d={`M${tx},${ty} Q${tx + Math.cos(ang) * 30},${ty + Math.sin(ang) * 30 - 10} ${tx + Math.cos(ang) * 60},${ty + Math.sin(ang) * 60}`} stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />;
      })}
      <circle cx={tx} cy={ty} r={12} fill={c} />
    </g>
  );
};
const Crawler: React.FC<{ x: number; y: number; s: number; t: number; face?: 1 | -1 }> = ({ x, y, s, t, face = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`}>
    {[-24, -12, 0, 12, 24].map((lx, i) => (
      <line key={i} x1={lx} y1={-6} x2={lx + Math.sin(t * 12 + i) * 5} y2={4} stroke="#7a3a2a" strokeWidth={4} strokeLinecap="round" />
    ))}
    <ellipse cx={0} cy={-16} rx={42} ry={20} fill="#c8743a" />
    <ellipse cx={30} cy={-18} rx={18} ry={16} fill="#e0904a" />
    {[-22, -10, 2, 14].map((sx, i) => (
      <path key={i} d={`M${sx},-34 Q${sx + 3},-16 ${sx},0`} stroke="#8a4a2a" strokeWidth={3} fill="none" />
    ))}
    <rect x={-40} y={-20} width={70} height={6} rx={3} fill="#f2b06a" opacity={0.6} />
    <circle cx={36} cy={-24} r={3.5} fill="#1a1030" />
  </g>
);
const ConeShell: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 1.6) * 10}) scale(${s} ${Math.abs(s)})`}>
    <path d="M0,-26 L-240,-6 Q-252,0 -240,6 L0,26 Z" fill="#f6dcb4" />
    {[-30, -70, -110, -150, -190].map((sx, i) => (
      <path key={i} d={`M${sx},${-24 + i * -0 + (Math.abs(sx) / 240) * 18} L${sx},${24 - (Math.abs(sx) / 240) * 18}`} stroke="#d9925a" strokeWidth={9} />
    ))}
    {[-16, -6, 4, 14].map((ty, i) => (
      <path key={i} d={`M0,${ty} Q${30 + Math.sin(t * 4 + i) * 8},${ty + 4} ${54 + Math.sin(t * 3 + i) * 10},${ty * 1.6}`} stroke="#ff9a7a" strokeWidth={7} fill="none" strokeLinecap="round" />
    ))}
    <circle cx={6} cy={-8} r={6} fill="#1a1030" />
  </g>
);
export const S11: React.FC<SP> = ({ t }) => {
  // 50 → 51.25: the Earth spins backwards fast (rewind); then the ancient sea
  if (t < T.ord) {
    const k = r(t, T.s11, T.ord, (x) => x);
    return (
      <AbsoluteFill>
        <Svg>
          <SpaceBg id="rw" t={t * 6} seed={12} drift={-60} />
          <g transform={`translate(540 860) rotate(${-k * 540}) translate(-540 -860)`}>
            {Array.from({ length: 10 }, (_, i) => (
              <circle key={i} cx={540} cy={860} r={260 + i * 38} fill="none" stroke={i % 2 ? N.violet : N.teal} strokeWidth={6} strokeDasharray={`${40 + i * 10} ${120 + i * 14}`} opacity={0.6 - i * 0.05} />
            ))}
          </g>
          <Earth id="erw" x={540} y={860} r={210} t={t} spin={-3} />
          <Pip x={170} y={2010 - spr(t, T.s11 + 0.05, 12, 0.5) * 230} s={4.2} t={t} look={[0.5, -0.6]} mood="wow" hop={0} />
          <Bubble t={t} at={T.s11 + 0.25} x={330} y={1360} text="Wait… what?!" size={54} />
        </Svg>
      </AbsoluteFill>
    );
  }
  const SEA = 900;
  const s = lerp(1.08, 1.0, r(t, T.ord, T.s12, INOUT));
  const R = rng(3);
  return (
    <AbsoluteFill>
      <Svg>
        <Grad id="oSky" stops={[[0, "#3a1680"], [0.25, "#a3287e"], [0.43, "#ff6f61"], [0.47, "#ffb06a"]]} />
        <Grad id="oSea" stops={[[0, "#1fb5b5"], [0.45, "#0f6f8f"], [1, "#0a2f5e"]]} />
        <g transform={cam(s, 540, 960)}>
          <rect x={-200} y={-200} width={W + 400} height={SEA + 240} fill="url(#oSky)" />
          <SpaceBg id="osp" t={t} top="transparent" bot="transparent" neb={0} drift={0} seed={18} />
          <Glow id="oSun" cx={760} cy={SEA - 10} r={300} color="#ffd08a" o={0.8} mid={0.3} />
          <circle cx={760} cy={SEA - 10} r={70} fill="#fff1c8" />
          <SkyArch id="oArch" cx={540} cy={SEA + 120} rx={1020} ry={760} w={0.7} k={1} glow={1.2} horizon={SEA} />
          <Grad id="oHaze" stops={[[0, "#ffb06a00"], [1, "#ffc98a"]]} />
          <rect x={-200} y={SEA - 260} width={W + 400} height={262} fill="url(#oHaze)" />
          <Cloud x={((t - T.ord) * 18 + 160) % 1400 - 100} y={560} s={0.7} color="#ff9ab0" shade="#e0608a" seed={3} />
          <Cloud x={((t - T.ord) * 12 + 820) % 1400 - 100} y={700} s={0.5} color="#ffb8a8" shade="#ff7a8a" seed={6} />
          <rect x={-200} y={SEA} width={W + 400} height={H} fill="url(#oSea)" />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M${100 + i * 180 + Math.sin(t * 0.5 + i) * 30},${SEA} L${40 + i * 180},${H} L${110 + i * 180},${H} Z`} fill="#bff5ff" opacity={0.06} />
          ))}
          <Wave t={t} y={SEA} amp={8} wl={240} speed={1.4} color="#5fd8d8" crest="#e0ffff" bottom={SEA + 26} />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={`g${i}`} x={760 - 30 - i * 6 + Math.sin(t * 3 + i) * 20} y={SEA + 12 + i * 3} width={60 + i * 12} height={5} rx={2.5} fill="#fff3c8" opacity={0.55 - i * 0.035} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <path key={`c${i}`} d={`M${-100 + i * 200 + Math.sin(t + i) * 40},${SEA + 140 + (i % 3) * 120} q60,-30 120,0 t120,0`} stroke="#bff5ff" strokeWidth={4} fill="none" opacity={0.18} />
          ))}
          {[
            [260, 1080, 1.0, N.pink],
            [880, 1300, 0.75, "#b06aff"],
            [640, 1420, 0.55, N.pink],
          ].map(([jx, jy, js, jc], i) => {
            const pulse = Math.sin(t * 3 + i * 2);
            const yy = (jy as number) - (t - T.ord) * 16 + pulse * 6;
            return (
              <g key={`j${i}`} transform={`translate(${jx} ${yy}) scale(${js as number} ${(js as number) * (1 - pulse * 0.06)})`} opacity={0.85}>
                <path d="M-46,0 Q-46,-52 0,-52 Q46,-52 46,0 Q24,-8 0,0 Q-24,-8 -46,0 Z" fill={jc as string} />
                <path d="M-30,-10 Q-26,-40 0,-44" stroke="#fff" strokeWidth={5} fill="none" opacity={0.5} strokeLinecap="round" />
                {[-30, -12, 6, 24].map((tx, k) => (
                  <path key={k} d={`M${tx},-2 q${8 + Math.sin(t * 4 + k) * 8},30 0,60 t0,50`} stroke={jc as string} strokeWidth={4} fill="none" opacity={0.7} />
                ))}
              </g>
            );
          })}
          <ConeShell x={((t - T.ord) * 90 + 200) % 1500} y={1180} s={1.0} t={t} />
          <ConeShell x={1200 - ((t - T.ord) * 60) % 1500} y={1000} s={-0.55} t={t + 2} />
          {Array.from({ length: 30 }, (_, i) => {
            const bx = R() * W;
            const by = SEA + 100 + ((R() * 900 - (t - T.ord) * (40 + R() * 50)) % 900 + 900) % 900;
            return <circle key={i} cx={bx + Math.sin(t * 2 + i) * 8} cy={by} r={3 + R() * 6} fill="none" stroke="#bff5ff" strokeWidth={2.5} opacity={0.5} />;
          })}
          <path d={`M-200,1640 Q200,1590 540,1630 Q860,1670 1300,1610 L1300,${H + 200} L-200,${H + 200} Z`} fill="#d99a4a" />
          <path d={`M-200,1700 Q300,1670 600,1700 Q900,1730 1300,1690 L1300,${H + 200} L-200,${H + 200} Z`} fill="#b8783a" />
          <Crinoid x={120} y={1660} h={230} t={t} c="#ff5f9e" />
          <Crinoid x={230} y={1650} h={160} t={t + 1} c="#ffa64a" />
          <Crinoid x={900} y={1650} h={250} t={t + 2} c="#b06aff" />
          <Crinoid x={990} y={1660} h={150} t={t + 3} c="#ff5f9e" />
          <Crawler x={380 + (t - T.ord) * 22} y={1665} s={1.2} t={t} />
          <Crawler x={760 - (t - T.ord) * 16} y={1690} s={0.9} t={t + 1} face={-1} />
          {/* dark foreground fronds frame the shot */}
          {[-30, 60, 1010, 1100].map((fx, i) => {
            const sw = Math.sin(t * 1.1 + i) * 30;
            return <path key={`fr${i}`} d={`M${fx - 30},${H + 50} Q${fx + sw},${1500} ${fx + sw * 1.6 + (i < 2 ? 40 : -40)},${1180 + i * 40} Q${fx + sw + 14},${1500} ${fx + 30},${H + 50} Z`} fill="#06304a" opacity={0.9} />;
          })}
        </g>
        <Tag t={t} at={53.75} x={540} y={260} stem={0} text="466 million years ago" color={N.orange} size={52} />
        <Tag t={t} at={54.6} x={540} y={300} stem={0} dir={-1} text="2024 hypothesis" color={N.violet} size={32} />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ the ring falls apart (craters near the equator)
export const S12: React.FC<SP> = ({ t }) => {
  const cx = 540;
  const cy = 860;
  const ER = 210;
  const fade = r(t, T.s12 + 0.2, T.s13 - 0.1, INOUT);
  const rot = -12;
  const R = rng(8);
  const fall = Array.from({ length: 14 }, (_, i) => ({ t0: T.s12 + 0.15 + i * 0.16, a: R() * Math.PI * 2, lon: (R() - 0.5) * 1.6, lat: (R() - 0.5) * 0.35 }));
  return (
    <AbsoluteFill>
      <Svg>
        <SpaceBg id="s12" t={t} seed={61} />
        <Ring id="s12b" cx={cx} cy={cy} R={ER} tilt={0.3} rot={rot} bands={ICE_BANDS} half="back" k={1 - fade * 0.9} />
        <Earth
          id="e12"
          x={cx}
          y={cy}
          r={ER}
          t={t}
          spin={0.02}
          extra={
            <g>
              <RingShadow cx={cx} cy={cy} R={ER} tilt={0.3} rot={rot} bands={ICE_BANDS} k={1 - fade} />
              {fall.map((f, i) => {
                const k = r(t, f.t0 + 0.35, f.t0 + 0.6);
                if (k <= 0) return null;
                const x = cx + f.lon * ER;
                const y = cy + f.lat * ER;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={lerp(4, 26, k) * (1 - k * 0.4)} fill="#ffd08a" opacity={1 - k * 0.6} />
                    <circle cx={x} cy={y} r={9} fill="#3a2a70" opacity={k * 0.8} />
                  </g>
                );
              })}
            </g>
          }
        />
        {fall.map((f, i) => {
          const k = r(t, f.t0, f.t0 + 0.4, (x) => x * x);
          if (k <= 0 || k >= 1) return null;
          const sx = cx + Math.cos(f.a) * ER * 2.1;
          const sy = cy + Math.sin(f.a) * ER * 0.6;
          const ex = cx + f.lon * ER;
          const ey = cy + f.lat * ER;
          const x = lerp(sx, ex, k);
          const y = lerp(sy, ey, k);
          return <line key={i} x1={x} y1={y} x2={lerp(sx, ex, Math.max(0, k - 0.2))} y2={lerp(sy, ey, Math.max(0, k - 0.2))} stroke="#fff3c8" strokeWidth={6} strokeLinecap="round" />;
        })}
        <Ring id="s12f" cx={cx} cy={cy} R={ER} tilt={0.3} rot={rot} bands={ICE_BANDS} half="front" k={1 - fade * 0.9} />
        <Tag t={t} at={T.s12 + 0.9} x={cx + 0.3 * ER} y={cy + 0.05 * ER} stem={330} dir={-1} dx={120} text="Craters near the equator" color={N.orange} size={38} />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ back on the roof
export const S13: React.FC<SP> = ({ t }) => {
  const s = lerp(1.18, 1.1, r(t, T.s13, T.end, INOUT));
  const ghost = 0.4 * r(t, 60.6, 62.0, INOUT) * (1 - r(t, 62.8, 64.4, INOUT));
  return <Rooftop t={t} s={s} fx={560} fy={1050} ghost={ghost} kidMood={t > 62.8 ? "happy" : "wow"} look={1} hop={t > 63.2 && t < 63.9 ? Math.abs(Math.sin((t - 63.2) * 9)) * 16 : 0} />;
};
