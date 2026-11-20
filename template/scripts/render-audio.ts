// Renders src/audio/score.ts (Web Audio API) offline and writes public/score.wav.
//   node scripts/render-audio.ts
import fs from "node:fs";
import path from "node:path";
import { OfflineAudioContext } from "node-web-audio-api";
import { buildScore } from "../src/audio/score.ts";
import { DURATION as SECS, FPS } from "../src/data/timeline.ts";
const DURATION = Math.round(SECS * FPS);

const SR = 48000;
const seconds = DURATION / FPS;
const ctx = new OfflineAudioContext(2, Math.round(SR * seconds), SR);
buildScore(ctx as unknown as BaseAudioContext);
const t0 = Date.now();
const buf = await ctx.startRendering();

const L = buf.getChannelData(0);
const R = buf.getChannelData(1);
let peak = 0;
for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const norm = peak > 0 ? 1 / peak : 1;
// soft-clip limiter: +5.5 dB drive into tanh, ceiling ≈ -1 dBFS (loud enough for social, no harsh clipping)
const DRIVE = 1.9;
const lim = (v: number) => (Math.tanh(v * norm * DRIVE) / Math.tanh(DRIVE)) * 0.89;
const out = Buffer.alloc(44 + L.length * 4);
out.write("RIFF", 0);
out.writeUInt32LE(36 + L.length * 4, 4);
out.write("WAVE", 8);
out.write("fmt ", 12);
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20);
out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 4, 28);
out.writeUInt16LE(4, 32);
out.writeUInt16LE(16, 34);
out.write("data", 36);
out.writeUInt32LE(L.length * 4, 40);
for (let i = 0, o = 44; i < L.length; i++, o += 4) {
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, lim(L[i]))) * 32767), o);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, lim(R[i]))) * 32767), o + 2);
}
const file = path.resolve("public/score.wav");
fs.writeFileSync(file, out);
console.log(`score.wav ${seconds}s, peak ${peak.toFixed(3)} → normalized, rendered in ${Date.now() - t0}ms`);
