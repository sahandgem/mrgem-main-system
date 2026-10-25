import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(fileURLToPath(new URL("../../..",import.meta.url)));
const git=(...args:string[])=>execFileSync("git",args,{cwd:root,encoding:"utf8"}).trim();
// Verify the historical trial merge in a full Git clone, independent of local worktrees.
const historicalMerge="e153060d6bb3be6c8a21adc7869eff849925be9a";
const expectedParents=[
  "d8cf865e595b3976de1f018d44f35b148879d99b",
  "62f8a69fd6effa9c89f4354edbbe097c3810d547",
];
const actualParents=git("show","-s","--format=%P",historicalMerge).split(/\s+/);
assert.deepEqual(actualParents,expectedParents,"historical Core merge retained its approved parents");
git("merge-base","--is-ancestor",historicalMerge,"HEAD");
const mergedFiles=git("diff","--name-only",expectedParents[0],historicalMerge).split(/\r?\n/).filter(Boolean);
assert.ok(mergedFiles.length>40,"historical Core merge must preserve its integrated scope");
assert.ok(mergedFiles.every(file=>file.startsWith("apps/core/")||file==="scripts/run-tests.mjs"),
  "historical Core merge unexpectedly changed another app");
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
console.log("C63 portable integration ancestry, ownership, route gating, and opt-in PASS");
