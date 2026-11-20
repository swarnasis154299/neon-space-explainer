import React from "react";
import { AbsoluteFill, Composition, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Film } from "./Film";
import { FPS, FRAMES, H, W } from "./data/timeline";

// "Final" plays public/score.wav (narrated: voice + score from scripts/mix.py) — use score.wav for a wordless film.
const WithSound: React.FC = () => (
  <AbsoluteFill>
    <Film />
    <Audio src={staticFile("score.wav")} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Final" component={WithSound} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Film" component={Film} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
  </>
);
