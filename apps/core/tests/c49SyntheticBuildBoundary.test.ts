import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const testsDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/, ""));
const fixtureRoot = path.join(testsDir, "c49-built-cockpit");
const fixtureEntry = fs.readFileSync(path.join(fixtureRoot, "main.tsx"), "utf8");
const fixtureConfig = fs.readFileSync(path.join(fixtureRoot, "vite.config.mjs"), "utf8");
const appMain = fs.readFileSync(path.join(testsDir, "..", "src", "main.tsx"), "utf8");
const appViteConfig = fs.readFileSync(path.join(testsDir, "..", "vite.config.mjs"), "utf8");

assert.match(fixtureEntry, /VITE_C49_SYNTHETIC_ONLY/);
assert.match(fixtureEntry, /CommandCenterModuleOverview/);
assert.doesNotMatch(fixtureEntry, /supabase\.auth|createClient|fetch\(|new WebSocket/);
assert.match(fixtureConfig, /C49_SYNTHETIC_BUILD_ENABLED/);
assert.match(fixtureConfig, /C49_DISPOSABLE_OUT_DIR/);
assert.match(fixtureConfig, /C49_REFUSING_TO_OVERWRITE_EXISTING_OUTPUT/);
assert.match(fixtureConfig, /os\.tmpdir\(\)/);
assert.doesNotMatch(appMain, /c49-built-cockpit|VITE_C49_SYNTHETIC_ONLY/);
assert.doesNotMatch(appViteConfig, /c49-built-cockpit|C49_SYNTHETIC_BUILD_ENABLED/);
console.log("C49 disposable built Cockpit separation tests passed.");
