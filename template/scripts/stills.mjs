// node scripts/stills.mjs <name> <frames: a,b,c | a-b-step> [scale=0.25] [png]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const [name, list, scaleArg, fmt, compArg] = process.argv.slice(2);
const frames = list.includes("-")
  ? (() => { const [a, b, s] = list.split("-").map(Number); const o = []; for (let f = a; f <= b; f += s || 1) o.push(f); return o; })()
  : list.split(",").map(Number);
const scale = Number(scaleArg ?? 0.25);
const png = fmt === "png";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
const composition = await selectComposition({ serveUrl, id: compArg ?? "Film", puppeteerInstance: browser });
const dir = `previews/${name}`;
fs.mkdirSync(dir, { recursive: true });
const t0 = Date.now();
for (const fr of frames) {
  const out = `${dir}/f${String(fr).padStart(4, "0")}.${png ? "png" : "jpg"}`;
  await renderStill({ composition, serveUrl, output: out, frame: fr, imageFormat: png ? "png" : "jpeg", ...(png ? {} : { jpegQuality: 88 }), scale, puppeteerInstance: browser, chromiumOptions: { gl: "angle" }, timeoutInMilliseconds: 180000,
    onBrowserLog: (l) => { if (l.type === "error") console.log("BROWSER", l.text.slice(0, 400)); } });
}
await browser.close({ silent: true });
console.log(`rendered ${frames.length} stills in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (!png) {
  fs.mkdirSync("contact-sheets", { recursive: true });
  execFileSync("python", ["scripts/sheet.py", dir, `contact-sheets/${name}.jpg`], { stdio: "inherit" });
}
fs.rmSync(serveUrl, { recursive: true, force: true });
