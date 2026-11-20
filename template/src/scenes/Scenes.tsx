import React from "react";
import { AbsoluteFill } from "remotion";
import { N } from "../data/style";
import { T } from "../data/timeline";
import { cam, Person, Svg } from "../components/Art";
import { Bubble, Card, Earth, ICE_BANDS, IceMoon, NotToScale, Pip, Ring, RingShadow, SkyArch, SpaceBg, Tag, Title } from "../components/Space";
import { INOUT, lerp, r, spr } from "../lib/motion";

// Starter scenes — one of each core device. Every scene is a pure function of absolute time t.
type SP = { t: number };

// 1 · hook: big outlined title over a night scene with the cast
export const S1: React.FC<SP> = ({ t }) => (
  <AbsoluteFill>
    <Svg>
      <SpaceBg id="s1" t={t} />
      <SkyArch id="s1a" cx={540} cy={1700} rx={1000} ry={900} w={0.6} k={0.8} glow={1} horizon={1300} />
      <path d="M-100,1300 Q540,1220 1180,1300 L1180,2000 L-100,2000 Z" fill="#2c2284" />
      <Person id="kid" x={470} y={1290} s={2.6} age="child" face={1} turn={0.8} hair="curly" skin="#c9784a" cloth="#ff8a2a" cloth2="#ffd15c" mood="wow" armR={lerp(18, 118, r(t, 1.4, 2.2))} elbowR={0} armL={10} t={t} rim="#c9d4ff" />
      <Pip x={660} y={1292} s={1.2} t={t} look={[0.2, -1]} mood="wow" />
    </Svg>
    <Title t={t} at={T.title} out={4.6} small="What if Earth had" big="Rings?" y={230} />
  </AbsoluteFill>
);

// 2 · diagram: a ringed planet with a tag on a leader line and a zoom-inset card
export const S2: React.FC<SP> = ({ t }) => {
  const cx = 540;
  const cy = 760;
  const ER = 170;
  const s = lerp(1.0, 1.06, r(t, T.s2, T.s3, INOUT));
  return (
    <AbsoluteFill>
      <Svg>
        <SpaceBg id="s2" t={t} seed={8} />
        <g transform={cam(s, cx, cy)}>
          <Ring id="r2b" cx={cx} cy={cy} R={ER} tilt={0.3} rot={-12} bands={ICE_BANDS} half="back" />
          <Earth id="e2" x={cx} y={cy} r={ER} t={t} extra={<RingShadow cx={cx} cy={cy} R={ER} tilt={0.3} rot={-12} bands={ICE_BANDS} />} />
          <Ring id="r2f" cx={cx} cy={cy} R={ER} tilt={0.3} rot={-12} bands={ICE_BANDS} half="front" />
        </g>
        <NotToScale />
        <Tag t={t} at={T.s2 + 0.3} x={540} y={760 - ER * s} stem={90} text="Earth" color={N.blue} size={46} />
        <Card id="c2" t={t} at={T.card} x={540} y={1230} w={640} h={300} border={N.teal} bg="#120a40" to={[640, 900]}>
          <SpaceBg id="c2bg" t={t} top="#0d0838" bot="#1c0f5c" neb={0} drift={0} seed={2} />
          <IceMoon id="c2m" x={0} y={0} r={70} />
        </Card>
        <Tag t={t} at={T.card + 0.25} x={540} y={1370} stem={0} dir={-1} text="Up close" color={N.teal} size={38} />
      </Svg>
    </AbsoluteFill>
  );
};

// 3 · reaction close-up: the sidekick springs up with a speech bubble
export const S3: React.FC<SP> = ({ t }) => (
  <AbsoluteFill>
    <Svg>
      <SpaceBg id="s3" t={t} seed={12} />
      <Earth id="e3" x={540} y={760} r={210} t={t} spin={0.2} />
      <Pip x={220} y={2010 - spr(t, T.s3 + 0.05, 12, 0.5) * 230} s={4.2} t={t} look={[0.5, -0.6]} mood="wow" />
      <Bubble t={t} at={T.s3 + 0.3} x={380} y={1360} text="Wait… what?!" size={54} />
    </Svg>
  </AbsoluteFill>
);
