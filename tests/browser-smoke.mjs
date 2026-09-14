import { chromium } from "playwright";\nimport { writeFile } from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on("pageerror", error => errors.push("PAGE: " + error.message));
page.on("console", msg => {
  if (msg.type() === "error") errors.push("CONSOLE: " + msg.text());
});

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.waitForSelector("#game canvas");
await page.waitForTimeout(1000);
await page.keyboard.press("KeyZ");
await page.waitForTimeout(500);
for (let i = 0; i < 5; i++) {
  await page.keyboard.press("KeyZ");
  await page.waitForTimeout(250);
}

const canvasState = await page.locator("#game canvas").evaluate(canvas => {
  const context = canvas.getContext("2d");
  if (!context) return { renderer: "webgl", width: canvas.width, height: canvas.height };
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const colors = new Set();
  for (let i = 0; i < data.length; i += Math.max(4, Math.floor(data.length / 5000 / 4) * 4)) {
    colors.add(data[i] + "," + data[i+1] + "," + data[i+2] + "," + data[i+3]);
  }
  return { renderer: "canvas", width: canvas.width, height: canvas.height, uniqueColors: colors.size };
});
console.log("CANVAS_STATE " + JSON.stringify(canvasState));
console.log("STATUS_TEXT " + await page.locator(".status").innerText());
await page.screenshot({ path: "lost-light-smoke.png", fullPage: true });
await browser.close();

const result = [
  "CANVAS_STATE " + JSON.stringify(canvasState),
  "STATUS_TEXT " + await page.locator(".status").innerText().catch(() => "unavailable"),
  ...errors
].join("\n");
await writeFile("smoke-result.txt", result + "\n");
if (errors.length) console.error(errors.join("\n"));
