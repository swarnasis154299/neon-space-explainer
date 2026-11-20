import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CAPS, FPS, SC, SceneId, XF } from "./data/timeline";
import { Grain } from "./components/Art";
import { r } from "./lib/motion";
import { Caption } from "./components/Space";
import { S1, S2, S3, S5, S6 } from "./scenes/ScenesA";
import { S7, S8, S9, S10, S11, S12, S13 } from "./scenes/ScenesB";

loadBarlow("normal", { weights: ["700"], subsets: ["latin"] });
loadFredoka("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
loadNunito("normal", { weights: ["700", "800"], subsets: ["latin"] });

const SCENES: Record<SceneId, React.FC<{ t: number }>> = { s1: S1, s2: S2, s3: S3, s5: S5, s6: S6, s7: S7, s8: S8, s9: S9, s10: S10, s11: S11, s12: S12, s13: S13 };
const IDS = Object.keys(SC) as SceneId[];

/** Every scene is a pure function of absolute time t. A scene stays mounted under the next while that one crossfades in. */
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: "#0c0620" }}>
      {IDS.map((id, k) => {
        const [a, b] = SC[id];
        const next = IDS[k + 1];
        const tail = next ? XF[next] : 0;
        if (t < a || t >= b + tail) return null;
        const Sc = SCENES[id];
        const o = XF[id] > 0 ? r(t, a, a + XF[id]) : 1;
        return (
          <AbsoluteFill key={id} style={{ opacity: o, transform: `scale(${1 + 0.05 * (1 - r(t, a, a + 0.5))})` }}>
            <Sc t={t} />
          </AbsoluteFill>
        );
      })}
      {CAPS.map(([a, b, txt], i) => (
        <Caption key={i} t={t} at={a} out={b} text={txt} />
      ))}
      <Grain frame={frame} k={0.05} vig={0.45} />
    </AbsoluteFill>
  );
};
