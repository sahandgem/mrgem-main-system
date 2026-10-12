import {existsSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(fileURLToPath(new URL("../../..",import.meta.url)));
if(process.argv.length!==3||process.argv[2]!=="--summary")throw Error("C55_SUMMARY_ONLY");
const stages=["C51-BROWSER-SESSION","C52-OFFLINE-FAILURE","C53-STATE-SIGNALS","C54-BROWSER-UX"];
const missing=stages.map(x=>path.join(root,"apps","core","docs","COCKPIT-"+x+".fa.md")).filter(f=>!existsSync(f)).map(f=>path.basename(f));
const report={
 phase:"C55",scope:"LOCAL_CORE_OFFLINE_ONLY",documentsFound:stages.length-missing.length,
 missing,unitTestsCertifiedByThisScript:false,browserTestsCertifiedByThisScript:false,
 buildCertifiedByThisScript:false,independentlyReviewed:false,
 decision:"NO_GO_PENDING_INDEPENDENT_REVIEW",productionAuthorized:false,
 mergeAuthorized:false,pushAuthorized:false,deploymentAuthorized:false,
 liveDataAuthorized:false,migrationAuthorized:false,
};
console.log(JSON.stringify(report,null,2));
if(missing.length)process.exitCode=2;
