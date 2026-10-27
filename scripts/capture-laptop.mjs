import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = path.join(root, urlPath.replace(/^\//, ""));
    if (urlPath === "/") filePath = path.join(root, "scripts/render-laptop.html");
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mime[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 1280 },
  deviceScaleFactor: 1,
});

console.log("open render page…");
await page.goto(`${base}/scripts/render-laptop.html`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__READY__ === true, null, { timeout: 60000 });
console.log("ready → record webm");

const webm = await page.evaluate(async () => {
  const bytes = await window.__recordWebm__();
  return Array.from(bytes);
});

const poster = await page.evaluate(() => Array.from(window.__posterPng__()));

await mkdir(outDir, { recursive: true });
const webmPath = path.join(outDir, "hero-laptop.webm");
const posterPath = path.join(outDir, "hero-laptop.png");
await writeFile(webmPath, Buffer.from(webm));
await writeFile(posterPath, Buffer.from(poster));

const w = await stat(webmPath);
const p = await stat(posterPath);
console.log(`wrote ${webmPath} (${w.size} bytes)`);
console.log(`wrote ${posterPath} (${p.size} bytes)`);

await browser.close();
server.close();
