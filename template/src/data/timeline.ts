// Starter cue sheet (wordless, 96 BPM grid: beat 0.625 s, bar 2.5 s). Replace with your film's beats.
// Narrated variant: generate src/data/script.json with scripts/build_voice.py and derive these cues from words/clips
// (see storybook-explainer/examples/timeline-narrated.ts for the word()/S()/E() helpers).
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION = 12.5;
export const FRAMES = Math.round(DURATION * FPS);
export const B = 0.625;
export const BAR = 2.5;

export const T = {
  s1: 0,
  title: 0.35,
  s2: 5,
  card: 6.25,
  s3: 7.5,
  end: 12.5,
};

export const SC = {
  s1: [T.s1, T.s2],
  s2: [T.s2, T.s3],
  s3: [T.s3, T.end],
} as const;
export type SceneId = keyof typeof SC;
// crossfade into each scene (0 = hard cut — the default language of this style)
export const XF: Record<SceneId, number> = { s1: 0, s2: 0, s3: 0 };

// captions: [start, end, text] — the Caption component shows 2–3 words at a time
export const CAPS: [number, number, string][] = [
  [1.6, 4.9, "What would change overnight?"],
  [5.2, 7.4, "Every object gets a tag,"],
  [7.6, 9.9, "a zoom card"],
  [10.0, 12.3, "and a reaction shot."],
];
