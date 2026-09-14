import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on("pageerror", error => errors.push("PAGE: " + error.message));
page.on("console", msg => {
  if (msg.type() === "error") errors.push("CONSOLE: " + msg.text());
});

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.waitForSelector("#game canvas");
await page.waitForTimeout(1200);
const canvasState = await page.locator("#game canvas").evaluate(canvas => ({
  width: canvas.width,
  height: canvas.height,
  visible: canvas.getBoundingClientRect().width > 0 && canvas.getBoundingClientRect().height > 0
}));
const statusText = await page.locator(".status").innerText();
await page.screenshot({ path: "lost-light-smoke.png", fullPage: true });
const result = [
  "CANVAS_STATE " + JSON.stringify(canvasState),
  "STATUS_TEXT " + statusText,
  ...errors
].join("\n");
await writeFile("smoke-result.txt", result + "\n");
console.log(result);
await browser.close();
if (errors.length) process.exit(1);
