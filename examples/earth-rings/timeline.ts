// "What if Earth had rings?" — wordless vertical reel. Cuts sit on a 96 BPM grid (beat 0.625 s, bar 2.5 s).
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION = 65;
export const FRAMES = Math.round(DURATION * FPS);
export const B = 0.625;
export const BAR = 2.5;

// cue sheet — every visual + sound beat
export const T = {
  s1: 0,
  title: 0.35,
  s2: 5,
  saturnCard: 6.25,
  ruler: 7.5,
  edge: 8.75,
  s3: 10,
  roche: 10.6,
  shred: 12.5,
  s4: 15, // rubble spreads into a ring (same scene, camera tilts)
  upgraded: 17.5,
  s5: 20,
  s6: 25,
  s7: 30,
  s8: 35,
  winter: 37.5,
  s9: 40,
  hit: 42.5,
  s10: 45,
  s11: 50,
  ord: 51.25,
  s12: 57.5,
  s13: 60,
  end: 65,
};

export const SC = {
  s1: [T.s1, T.s2],
  s2: [T.s2, T.s3],
  s3: [T.s3, T.s5],
  s5: [T.s5, T.s6],
  s6: [T.s6, T.s7],
  s7: [T.s7, T.s8],
  s8: [T.s8, T.s9],
  s9: [T.s9, T.s10],
  s10: [T.s10, T.s11],
  s11: [T.s11, T.s12],
  s12: [T.s12, T.s13],
  s13: [T.s13, T.end],
} as const;
export type SceneId = keyof typeof SC;
// crossfade into each scene (0 = hard cut, the reference's language)
export const XF: Record<SceneId, number> = { s1: 0, s2: 0, s3: 0, s5: 0, s6: 0, s7: 0, s8: 0, s9: 0, s10: 0, s11: 0, s12: 0.35, s13: 0.5 };

// captions: [start, end, text] — shown 2–3 words at a time, lower third
export const CAPS: [number, number, string][] = [
  [1.6, 4.9, "Our sky is missing something."],
  [5.2, 7.4, "Saturn's rings are mostly ice,"],
  [7.5, 8.7, "about 280,000 km wide,"],
  [8.75, 9.95, "yet often just 10 m thick."],
  [10.25, 12.45, "Send an icy moon too close…"],
  [12.5, 14.9, "and Earth's gravity tears it apart."],
  [15.2, 17.4, "The rubble spreads into a ring."],
  [17.6, 19.9, "Earth, upgraded."],
  [20.2, 22.4, "From most of the world,"],
  [22.45, 24.9, "a giant arch across the sky."],
  [25.2, 27.5, "At the equator: a thin line."],
  [27.6, 29.9, "Near the poles: barely there."],
  [30.2, 32.45, "Nights would never get fully dark,"],
  [32.5, 34.9, "lit by sunlight off the ring."],
  [35.2, 37.45, "But rings cast shadows,"],
  [37.5, 39.9, "making winters even colder."],
  [40.2, 42.45, "Satellites would have to dodge"],
  [42.5, 44.9, "a belt of space gravel."],
  [45.2, 47.45, "And loose bits would rain down"],
  [47.5, 49.9, "as shooting stars."],
  [50.2, 51.2, "Plot twist:"],
  [51.3, 53.7, "Earth may have had a ring,"],
  [53.75, 57.3, "466 million years ago."],
  [57.6, 59.9, "Then it slowly fell apart."],
  [60.4, 62.7, "So maybe we just missed ours,"],
  [62.75, 64.6, "by 466 million years."],
];
