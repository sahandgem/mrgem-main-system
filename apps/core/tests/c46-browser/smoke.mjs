import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const base = process.argv[2];
if (!/^http:\/\/127\.0\.0\.1:5176\/$/.test(base || "")) {
  throw Error("C46_LOCAL_VITE_URL_ONLY");
}
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9800 + (process.pid % 1000);
const dir = await mkdtemp(path.join(os.tmpdir(), "c46-browser-"));
const proc = spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, "about:blank",
], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJson(url, opts) {
  for (let i = 0; i < 70; i++) {
    try { const r = await fetch(url, opts); if (r.ok) return await r.json(); } catch {}
    await sleep(100);
  }
  throw Error("C46_BROWSER_START_TIMEOUT");
}

try {
  await getJson(`http://127.0.0.1:${port}/json/version`);
  const target = await getJson(
    `http://127.0.0.1:${port}/json/new?` + encodeURIComponent(base + "tests/c46-browser/index.html"),
    { method: "PUT" },
  );
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  let seq = 0;
  const pending = new Map();
  const pageErrors = [];
  ws.addEventListener("message", event => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? p.reject(Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
    } else if (msg.method === "Runtime.exceptionThrown") {
      pageErrors.push(msg.params?.exceptionDetails?.text || "browser exception");
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error("C46_BROWSER_EVAL_FAILED");
    return r.result.value;
  };
  async function waitFor(expression, expected = true) {
    for (let i = 0; i < 75; i++) {
      if ((await evaluate(expression)) === expected) return;
      await sleep(120);
    }
    throw Error("C46_BROWSER_WAIT_FAILED: " + expression);
  }
  async function fill(name, value) {
    await evaluate(`document.querySelector('input[name="${name}"]').focus();true`);
    await send("Input.insertText", { text: value });
    await sleep(100);
  }
  async function visit(url, width, height) {
    await send("Emulation.setDeviceMetricsOverride", {
      width, height, deviceScaleFactor: 1, mobile: width <= 720,
      screenWidth: width, screenHeight: height,
    });
    await send("Page.navigate", { url });
    await waitFor("!!document.querySelector('#core-login-title')");
  }
  async function capture(filename) {
    const result = await send("Page.captureScreenshot", {
      format: "png", captureBeyondViewport: false, fromSurface: true,
    });
    await writeFile(path.join(os.tmpdir(), filename), Buffer.from(result.data, "base64"));
  }

  await send("Runtime.enable");
  await send("Page.enable");
  const checks = [];
  await visit(base + "tests/c46-browser/index.html", 1365, 768);
  assert.equal(await evaluate("document.querySelector('.core-auth-submit').disabled"), true);
  assert.equal(await evaluate("document.querySelector('.cockpit-stage')!==null"), false);
  checks.push("default login gated: no session, no cockpit, submit disabled");
  await capture("c46-login-desktop.png");

  await fill("email", "pilot@example.test");
  await fill("password", "wrong-password");
  await waitFor("!document.querySelector('.core-auth-submit').disabled");
  await evaluate("document.querySelector('.core-auth-submit').click(); true");
  await waitFor("document.body.innerText.includes('ایمیل یا رمز عبور صحیح نیست.')");
  assert.equal(await evaluate("window.__C46_TEST__.statistics.unauthorized"), 1);
  checks.push("wrong credentials stay at login and display sanitized rejection");

  await visit(base + "tests/c46-browser/index.html", 420, 800);
  assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
  await capture("c46-login-mobile.png");
  checks.push("mobile 420px login has no horizontal overflow");
  await fill("email", "pilot@example.test");
  await fill("password", "synthetic-pass-only");
  await waitFor("!document.querySelector('.core-auth-submit').disabled");
  await evaluate("document.querySelector('.core-auth-submit').click(); true");
  await waitFor("document.body.innerText.includes('مسیر داده مدیریتی هنوز بسته است')");
  assert.equal(await evaluate("document.querySelector('.cockpit-stage') !== null"), false);
  assert.equal(await evaluate("window.__C46_TEST__.statistics.networkCalls"), 0);
  checks.push("successful fake sign-in opens closed manager gate, never Mock or network");
  await evaluate("document.querySelector('.core-auth-gate button').click(); true");
  await waitFor("!!document.querySelector('#core-login-title')");
  assert.equal(await evaluate("window.__C46_TEST__.statistics.signOuts"), 1);
  checks.push("local logout restores login UI");

  await visit(base + "tests/c46-browser/index.html?runtime=mock", 1365, 768);
  await fill("email", "pilot@example.test");
  await fill("password", "synthetic-pass-only");
  await waitFor("!document.querySelector('.core-auth-submit').disabled");
  await evaluate("document.querySelector('.core-auth-submit').click(); true");
  await waitFor("document.body.innerText.includes('مسیر داده مدیریتی هنوز بسته است')");
  assert.equal(await evaluate("document.querySelector('.cockpit-stage') !== null"), false);
  checks.push("explicitly injected Mock runtime rejected on manager route");
  assert.deepEqual(pageErrors, []);
  checks.push("no runtime exceptions in headless Chrome");
  console.log(JSON.stringify({
    status: "PASS", phase: "C46", checks: checks.length, scenarios: checks,
    screenshots: ["c46-login-desktop.png", "c46-login-mobile.png"],
    data: "synthetic-only", productionTouched: false,
  }, null, 2));
  ws.close();
} finally {
  if (proc.exitCode === null) proc.kill("SIGKILL");
  await Promise.race([
    new Promise(resolve => proc.once("exit", resolve)),
    sleep(3500),
  ]);
  // Windows may briefly hold the Chrome profile lock after process exit.
  await rm(dir, {
    recursive: true, force: true, maxRetries: 12, retryDelay: 350,
  });
}
