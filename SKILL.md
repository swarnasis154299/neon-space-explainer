---
name: neon-space-explainer
description: Make a punchy vertical "What if…?" science / space explainer reel (Shorts, Reels, TikTok) in a neon flat-vector space style — deep navy/violet starfields, glowing two-tone planets, rounded pill tags on leader lines, zoom-inset cards, dashed orbits, "Not to scale" tags, full-bleed surface scenes, an original kid + critter duo who react in close-ups, and bold 2–3-word captions in the lower third — built in Remotion with an original Web Audio score + SFX (wordless) or a Fish Audio voiceover. Use whenever the user asks for a neon space-explainer / space / astronomy / "what if Earth…" / science explainer short, wants a reference space-explainer reel's style adapted, says "use the neon-space-explainer skill", or asks to re-time, re-score or re-render earth-rings or a project made with this skill.
---

# Neon space explainer

A pipeline: **analyse reference → script/beat sheet → cue sheet → scenes → score + SFX → review stills → render.** Everything is code (Remotion + SVG + Web Audio), deterministic and original.

The finished example is `earth-rings/` ("What if Earth had rings?", 65 s, wordless). Its scene files, score and cue sheet are copied in `examples/earth-rings/`, together with a contact sheet.

## 0. Decide (ask only what you cannot default)

| Decision | Default |
|---|---|
| Format | 1080×1920 vertical, 30 fps |
| Length | 60–70 s (26 bars at 96 BPM = 65 s) |
| Voice | Wordless (music + SFX + captions) unless the user wants VO. For VO, **check Fish credits first**: `get_credit_balance`, 1 credit/byte, 500 bytes/call. If it doesn't fit, ask: top up / shorter / wordless. |
| Topic | "What if Earth had / swapped / lost X?" with an arc: **hook → how it works → 2–3 perks → 2–3 costs → twist (a real fact) → callback ending** |
| Reference video | adapt its style DNA, **never clone** its layout, script, characters or exact compositions |

## 1. Analysing a reference (when the user gives one)

```bash
FF=tools/ffbin/ffmpeg.exe        # full ffmpeg; call with relative/Windows paths, not /c/... paths
"$FF" -i refs/ref.mp4 -vf "fps=2,scale=240:-1" refs/f/%04d.png
python -I scripts/sheet.py refs/f refs/sheet.jpg   # labelled contact sheet of the frames
```
Read every sheet. Note: cut rhythm, palette, label system, recurring devices, captions (size, position, words per chunk), characters and the story arc. Write down what to **keep** (the style) and what to **change** (topic, cast, compositions).

## 2. Beat sheet + facts

- One beat per 2.5 s bar, with a new image every 2–3 s. Captions say each beat in ≤ 6 words, and the `Caption` component chunks them into 2–3 word pops.
- **Verify every fact** with WebSearch, and hedge hypotheses on screen (for example, a small "2024 hypothesis" tag). On-screen numbers carry "~" and must match the sources.
- End on a callback to the opening shot, plus a twist line.

## 3. Scaffold

```bash
bash .claude/skills/neon-space-explainer/template/new_project.sh <name>
```
This creates `src/components/Space.tsx` (the kit), `Art.tsx` (camera, glows, clouds, waves, palms, the `Person` rig), `Character.tsx`, `data/style.ts` (palette `N`), `data/timeline.ts` (cue sheet), `scenes/Scenes.tsx` (three starter scenes), `audio/score.ts` (instrument kit + `groove()`), and the scripts.

`timeline.ts` holds `T` (named cues), `SC` (scene windows), `XF` (crossfades, 0 = hard cut) and `CAPS` (captions). Scenes read only `T`. For more than ~6 scenes, split them into `ScenesA.tsx` / `ScenesB.tsx`.

## 4. The kit (`components/Space.tsx`)

| Piece | Use |
|---|---|
| `SpaceBg` | navy→violet gradient, nebula glows, twinkling stars, four-point sparkles. Use `top="transparent"` to overlay stars on another sky |
| `Planet` | disc + clipped surface children + darker night-side crescent + rim light + glow |
| `Earth` / `EarthSurf` / `IceMoon` | rotating blob continents, ice caps, cloud streaks. Pass `extra` for overlays clipped to the disc |
| `Ring` (`half="back"/"front"`) + `RingShadow` | banded annulus with ringlets and the planet's shadow on the back half. Draw back → planet → front. Put `RingShadow` in the planet's `extra`. `tilt→0` gives an edge-on hairline |
| `SkyArch` | a ring seen from the ground: a banded arch rising from the horizon (`horizon` clips it) |
| `Tag` | rounded pill on a leader line pointing at (x, y). `dir` 1 = above, −1 = below; `stem=0` sits it on a card border; `sub` = a small readout like "~2,575 km" |
| `Card` | zoom-inset card: thick border, rounded clip, stem to the target, content in local coordinates centred on 0,0 |
| `NotToScale` | corner tag for any diagram |
| `Caption` | lower-third bold white text, 2–3 words at a time, spring pop. Rendered globally by `Film` from `CAPS` |
| `Title` | outlined chunky hook title; an icy ring swoops around the big word |
| `Bubble` | white comic speech bubble with a tail, for reaction beats |
| `Pip` | the original teal critter sidekick (moods happy / wow / worried, `look`, `hop`, `point`, `face`) |
| `Scope` | telescope prop |
| `Person` (Art.tsx) | jointed human rig. `age="child"`, moods, hair, `turn`; `s` 2.5–3 for wide shots, ~8.4 for a face close-up |

**Palette `N`**: space `sp0…sp3`; tag colours `orange`, `blue`, `violet`, `teal`, `gold`, `pink`; ring ice `ice0…ice4`; Earth, Saturn and critter tokens. Give each object family a consistent tag colour.

## 5. Look rules (what made it a 10/10)

- **Rotate camera modes:** a space diagram with tags → a zoom card → a full-bleed surface scene (sky, sea, city) → a character reaction close-up → a split screen comparison. Never two diagrams in a row without a surface or character shot between them.
- **Every cut lands:** `Film` adds a 5% zoom punch on each scene start, and the score adds a swish plus a soft kick on each cut. Static space shots get a slow push-in (`cam(lerp(1, 1.06, …))`).
- **Constant secondary motion:** twinkle, drift, clouds, waves, grass sway, fireflies, parallax skylines, a blinking plane, swimming creatures.
- **Depth:** haze gradients where the sky meets the horizon, dark foreground silhouettes framing underwater or forest shots, rim light on characters matching the scene's light.
- **Physical detail sells it:** a planet shadow on its rings, a ring shadow on the planet, ringlets, an edge-on hairline, and Earth's shadow on a night arch.
- **Characters act:** wow / point / cheer in wide shots, plus at least two big close-ups (an awed face, a shocked sidekick with a bubble).
  - Child-rig arms are short. "Straight up" (168°) reads as a hand on the face, so use **≈118° with `elbow 0`** to point and **125°/125°** for an open-arms cheer.
- **Captions** sit at y≈1500 over a darker area. Check that they never land on white snow or clouds.
- **No HUD:** no timecodes, frame counters or scene numbers. Grain + vignette are fine.
- **Originality — non-negotiable:** design your own characters, creatures and props. Never reproduce a channel's mascots, logos, exact compositions or script, even when the user names that channel.

## 6. Score + SFX (`audio/score.ts`)

- 96 BPM grid, music **continuous** start to finish. `groove(t0, t1, bars, {drums, arp, mel, padV, cut})` lays chord + bass + pizz arp + kick/snap/shaker + an optional melody on the beat. Chord constants: `C, Am, F, G, Dm, E`; `theme` is the main melody.
- Mood follows the story: wonder pad + twinkles (hook) → groove (facts) → A-minor tension + riser → impact (event) → big wonder chord + bell arpeggio (payoff) → main theme (perks) → darker groove (costs) → rewind riser + impact + mysterious pad (twist) → warm return + final chord.
- SFX vocabulary:
  - `pop` on every tag or bubble
  - `whoosh` on moves and cuts
  - `impact` + `crumble` on break-ups
  - `clink` for debris, ice and hits
  - `tick` for crickets
  - `waves` / `bubble` / `splash` for sea scenes
  - `wind` for open landscapes
  - `shimmer` for magic moments
- `node scripts/render-audio.ts` → `public/score.wav` (normalised + soft limiter). **Measure** per-section RMS and aim for −15 to −18 dB with no section below −22 dB:
  ```python
  # read public/score.wav with wave+numpy, print 20*log10(rms) per scene window
  ```
- Linear ramps only. **Never use `setTargetAtTime`** (it blows up in node-web-audio-api offline).
- Narrated variant: use `scripts/words.py` (faster-whisper, run in the background) and `build_voice.py`, then `mix.py`. Root plays `master.wav` instead of `score.wav`. Follow storybook-explainer §2–3 for takes and PLAN rows.

## 7. Review loop

```bash
npx tsc -p .                                          # noUnusedLocals is on → `void x;` for spare helpers
node scripts/stills.mjs v1 60,190,340,...  0.25       # one+ still per beat → contact-sheets/v1.jpg — Read it
node scripts/stills.mjs hi 90,540,960 0.5             # half-res detail pass before the final render
rm -rf "$TEMP"/remotion-webpack-bundle-*              # C: is nearly full — always clean after stills/renders
```
Check: tags over their subject, captions readable, arms and poses, ring layering (back/front), `transparent` overlays (never pass `transparent` to colour maths), empty flat areas (add detail), and frames past `FRAMES` (stills crash).

## 8. Render + report

```bash
npx remotion render src/index.ts Final renders/<name>.mp4 --codec h264 --crf 17 --concurrency 4   # run_in_background
rm -rf "$TEMP"/remotion-webpack-bundle-*
propellerads-cinematic/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe -v error -show_entries format=duration,size:stream=codec_name,width,height -of compact renders/<name>.mp4
```
Report the path and specs, a compact shot table, what the sound does, the sources for facts, credits used/left, and honest limits (for example "verified stills + levels; not watched with sound").

## Gotchas (this machine)

- Windows exes (ffmpeg, ffprobe) need relative or Windows paths. Copy files with odd names (`'`, `!`) into `refs/` first.
- Python can't see Git Bash's `/tmp`. Write temp files inside the project and pass relative paths.
- Long generated files: use the Write tool. Heredocs with mixed quotes break.
- `Person` at `s` is ~110 units tall × s (kid ≈ 0.85 of that). Head centre ≈ `y − 80·s` for a kid.
