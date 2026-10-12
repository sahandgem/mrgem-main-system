import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(fileURLToPath(new URL("../../..",import.meta.url)));
const git=(...args)=>execFileSync("git",args,{cwd:root,encoding:"utf8"}).trim();
if(process.argv.length!==3||process.argv[2]!=="--summary")throw Error("C72_READ_ONLY_SUMMARY");
const branch=git("branch","--show-current");
const head=git("rev-parse","HEAD");
const remote=git("rev-parse","origin/codex/dev-core");
const counts=git("rev-list","--left-right","--count","origin/codex/dev-core...HEAD").split(/\s+/).map(Number);
const changed=git("diff","--name-only","origin/codex/dev-core...HEAD").split(/\r?\n/).filter(Boolean);
const outOfScope=changed.filter(x=>!(x.startsWith("apps/core/")||x==="scripts/run-tests.mjs"));
const clean=git("status","--porcelain")==="";
const ok=clean&&branch==="trial/core-merge-20261012"&&counts[0]===0&&counts[1]>0&&outOfScope.length===0;
console.log(JSON.stringify({stage:"C72",branch,head,remoteBranchSnapshot:remote,
  ahead:counts[1],behind:counts[0],changedFiles:changed.length,outOfScope,
  worktreeClean:clean,status:ok?"OFFLINE_REVIEW_READY_ONLY":"NO_GO",
  newFetchPerformed:false,remoteCurrentnessVerified:false,
  independentServerSecurityReviewed:false,mergeIntoDevelopment:false,
  productionReady:false,pushAuthorized:false,deployAuthorized:false,
  realServiceConnected:false,migrationAuthorized:false},null,2));
if(!ok)process.exitCode=2;
