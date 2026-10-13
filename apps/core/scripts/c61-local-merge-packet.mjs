import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";

if(process.argv.length!==3||process.argv[2]!=="--summary")throw Error("C61_READ_ONLY_SUMMARY_ONLY");
const repo=path.resolve(fileURLToPath(new URL("../../..",import.meta.url)));
function git(...args){return execFileSync("git",args,{cwd:repo,encoding:"utf8",stdio:["ignore","pipe","pipe"]}).trim();}
const branch=git("branch","--show-current");
const head=git("rev-parse","HEAD");
const developmentHead=git("rev-parse","codex/dev-core");
const [behind,ahead]=git("rev-list","--left-right","--count","codex/dev-core...HEAD").split(/\s+/).map(Number);
const changedPaths=git("diff","--name-only","codex/dev-core...HEAD").split(/\r?\n/).filter(Boolean);
const outsideScope=changedPaths.filter(file=>!(file.startsWith("apps/core/")||file==="scripts/run-tests.mjs"));
const dirty=git("status","--porcelain")!=="";
const correctBranch=branch==="feat/core-c50-auth-race-20261012";
const localReviewReady=correctBranch&&!dirty&&behind===0&&ahead>0&&outsideScope.length===0;
console.log(JSON.stringify({
 phase:"C61",mode:"LOCAL_READ_ONLY",branch,head,developmentHead,
 behindDevelopment:behind,aheadDevelopment:ahead,
 changedFiles:changedPaths.length,outsideScope,worktreeClean:!dirty,
 status:localReviewReady?"LOCAL_REVIEW_READY":"LOCAL_REVIEW_BLOCKED",
 networkFetched:false,remoteStateVerified:false,
 c9PersonalFilePreservedSeparately:true,c73ProductionFileUntouchedByThisWorktree:true,
 independentSecurityReviewCompleted:false,
 mergeAuthorized:false,pushAuthorized:false,deployAuthorized:false,
 migrationAuthorized:false,realDatabaseAuthorized:false,productionAuthorized:false
},null,2));
if(!localReviewReady)process.exitCode=2;
