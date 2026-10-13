import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(fileURLToPath(new URL("../../..",import.meta.url)));
const git=(...args:string[])=>execFileSync("git",args,{cwd:root,encoding:"utf8"}).trim();
assert.ok(["trial/core-merge-20261012","codex/dev-core"].includes(git("branch","--show-current")),
  "merge ownership test must run only on the approved trial or local development branch");
const parents=git("log","-1","--merges","--format=%P").split(" ");
assert.equal(parents.length,2,"previous trial merge retained both parents");
assert.equal(parents[0],git("rev-parse","origin/codex/dev-core"));
assert.equal(parents[1],git("rev-parse","feat/core-c50-auth-race-20261012"));
const changed=git("diff","--name-only","origin/codex/dev-core...HEAD").split(/\r?\n/).filter(Boolean);
assert.ok(changed.length>40);
assert.ok(changed.every(file=>file.startsWith("apps/core/")||file==="scripts/run-tests.mjs"),
  "unexpected cross-project change");
const app=readFileSync(path.join(root,"apps/core/src/App.tsx"),"utf8");
assert.match(app,/CoreAuthBoundary/);
assert.match(app,/showDevCommandCenter/);
const auth=readFileSync(path.join(root,"apps/core/src/components/auth/CoreAuthBoundary.tsx"),"utf8");
assert.match(auth,/isManagerLiveRuntime/);
assert.match(auth,/clearFridayMarketAccessToken/);
const data=readFileSync(path.join(root,"apps/core/src/integration/commandCenter/commandCenterRuntimeEnvironment.ts"),"utf8");
assert.match(data,/createOptInFridayMarketRuntimeEnvironment/);
assert.match(data,/mode: "live"/);
assert.match(data,/mode \?\? "mock"/);
console.log("C63 merge ancestry, ownership, route gating, and opt-in preservation PASS");
