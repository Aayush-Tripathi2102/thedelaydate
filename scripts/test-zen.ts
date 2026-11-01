/** Native WebDriver BiDi checks against Zen. No Chrome/driver downloads. */
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const socket = new WebSocket(process.env.ZEN_BIDI_URL || "ws://127.0.0.1:9222/session");
let nextId = 0;
const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();
socket.addEventListener("message", event => {
  const message = JSON.parse(String(event.data));
  const task = pending.get(message.id);
  if (!task) return;
  pending.delete(message.id);
  if (message.type === "error") task.reject(new Error(`${message.error}: ${message.message}`));
  else task.resolve(message.result);
});
await new Promise<void>((resolve, reject) => { socket.addEventListener("open", () => resolve(), { once: true }); socket.addEventListener("error", () => reject(new Error("Start Zen with --headless --no-remote --profile /tmp/opencode/zen-delay-date --remote-debugging-port 9222 first.")), { once: true }); });

async function command(method: string, params: object = {}): Promise<any> {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 30_000);
    pending.set(id, { resolve: result => { clearTimeout(timeout); resolve(result); }, reject: error => { clearTimeout(timeout); reject(error); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

let context: string;
const out = ".impeccable/review";
const results: string[] = [];
async function evaluate(body: string): Promise<any> {
  const result = await command("script.evaluate", { expression: `(async () => { ${body} })().then(value => JSON.stringify(value))`, target: { context }, awaitPromise: true });
  if (result.type === "exception") throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value ? JSON.parse(result.result.value) : undefined;
}
async function settle() {
  await evaluate(`await document.fonts.ready; await new Promise(r => setTimeout(r, 180)); return true;`);
}
async function capture(name: string) {
  await settle();
  const result = await command("browsingContext.captureScreenshot", { context, origin: "document", format: { type: "image/png" } });
  await writeFile(`${out}/${name}.png`, Buffer.from(result.data, "base64"));
}
async function checkOverflow(label: string) {
  const widths = await evaluate(`return { viewport: innerWidth, document: document.documentElement.scrollWidth };`);
  assert.ok(widths.document <= widths.viewport + 1, `${label} has horizontal overflow: ${JSON.stringify(widths)}`);
  results.push(`${label}: no horizontal overflow`);
}
async function viewport(width: number, height: number) {
  await command("browsingContext.setViewport", { context, viewport: { width, height }, devicePixelRatio: 1 });
}
async function load(path = "/") {
  await command("browsingContext.navigate", { context, url: `http://localhost:3000${path}`, wait: "complete" });
  await settle();
  await evaluate(`const style = document.createElement('style'); style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'; document.head.appendChild(style); return true;`);
}
try {
  await command("session.new", { capabilities: { alwaysMatch: { acceptInsecureCerts: false } } });
  context = (await command("browsingContext.create", { type: "tab" })).context;
  await mkdir(out, { recursive: true });
  await viewport(1440, 1000);
  await load();
  await checkOverflow("Desktop invitation");
  await capture("desktop");
  const first = await evaluate(`return document.querySelector('.button-no').getBoundingClientRect().toJSON();`);
  await command("input.performActions", { context, actions: [{ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" }, actions: [{ type: "pointerMove", x: Math.round(first.x + 10), y: Math.round(first.y + 10), duration: 100, origin: "viewport" }] }] });
  await settle();
  const moved = await evaluate(`const b = document.querySelector('.button-no').getBoundingClientRect(); return { x: b.x, y: b.y, right: b.right, bottom: b.bottom, w: innerWidth, h: innerHeight };`);
  assert.ok(first.x !== moved.x || first.y !== moved.y, "No must evade the pointer");
  assert.ok(moved.x >= 0 && moved.y >= 0 && moved.right <= moved.w && moved.bottom <= moved.h, "No must stay on screen");
  results.push("No evades mouse and stays within viewport");
  await evaluate(`document.querySelector('.button-no').focus(); return true;`);
  await command("input.performActions", { context, actions: [{ type: "key", id: "keyboard", actions: [{ type: "keyDown", value: " " }, { type: "keyUp", value: " " }] }] });
  await settle();
  assert.ok(await evaluate(`return document.querySelector('#no-hint').textContent.includes('no pressure');`));
  results.push("Keyboard No permits a genuine decline");
  await viewport(390, 844);
  await load();
  await checkOverflow("Mobile invitation");
  await capture("mobile");
  const touchNo = await evaluate(`return document.querySelector('.button-no').getBoundingClientRect().toJSON();`);
  await command("input.performActions", { context, actions: [{ type: "pointer", id: "finger", parameters: { pointerType: "touch" }, actions: [{ type: "pointerMove", x: Math.round(touchNo.x + 10), y: Math.round(touchNo.y + 10), origin: "viewport" }, { type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }] }] });
  await settle();
  assert.ok(await evaluate(`return document.querySelector('#no-hint').textContent.includes('no pressure');`));
  results.push("Native touch No is stable and permits a genuine decline");
  await evaluate(`document.querySelector('#yes-button').click(); return true;`);
  await settle();
  assert.ok(await evaluate(`return document.activeElement.tagName === 'H1';`));
  await capture("mobile-form");
  // Native setters let React see real bubbling input events.
  await evaluate(`const field = document.querySelector('#expectations'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(field, 'Good food, no naps, and please be on time.'); field.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('input[name="cuisine"][value="Italian"]').click(); document.querySelector('input[name="excitement"][value="Yessssss"]').click(); return true;`);
  await settle();
  await evaluate(`document.querySelector('form').requestSubmit(); return true;`);
  await settle();
  assert.ok(await evaluate(`return document.querySelector('h1').textContent.includes('Good things');`));
  await checkOverflow("Mobile review");
  await capture("mobile-review");
  await viewport(1440, 1000);
  await capture("desktop-review");
  // Mock both outcomes at the transport boundary. This script never sends email.
  await evaluate(`window.fetch = async () => new Response(JSON.stringify({ error: 'Test email engine is not connected. Nothing has been sent.' }), { status: 503, headers: { 'Content-Type': 'application/json' } }); document.querySelector('.book-button').click(); return true;`);
  await settle();
  assert.ok(await evaluate(`return document.querySelector('[role="alert"]').textContent.includes('Nothing has been sent');`));
  assert.ok(await evaluate(`return document.querySelector('.reservation-details').textContent.includes('Italian');`));
  results.push("Error is announced and preserves answers");
  await evaluate(`window.fetch = async () => new Response(JSON.stringify({ accepted: true, reference: 'LATE-UI-MOCK', mode: 'test' }), { status: 200, headers: { 'Content-Type': 'application/json' } }); document.querySelector('.book-button').click(); return true;`);
  await settle();
  assert.ok(await evaluate(`return document.querySelector('.success-copy').textContent.includes('Tannu has not been emailed');`));
  await capture("desktop-success");
  await viewport(390, 844);
  await checkOverflow("Mobile success");
  await capture("mobile-success");
  results.push("Mock acceptance shows test-only confirmation, never claims Shreya was emailed");
  await load("/email-preview");
  await checkOverflow("Mobile email preview");
  await capture("mobile-email");
  await viewport(1440, 1000);
  await capture("desktop-email");
  for (const width of [320, 768, 1024, 1280]) {
    await viewport(width, 900);
    await load();
    await checkOverflow(`${width}px invitation`);
  }
  console.log(JSON.stringify({ browser: "Zen (native WebDriver BiDi)", emailDelivery: "MOCKED — no mail sent", checks: results }, null, 2));
} finally {
  try { await command("session.end"); } catch { /* session may already be closed */ }
  socket.close();
}
