import assert from "node:assert/strict";
import {evaluateCoreOfflineReadiness, type CoreOfflineGate} from "../src/integration/commandCenter/c55OfflineReadiness.ts";

const names: CoreOfflineGate[] = ["C51","C52","C53","C54","CORE_TESTS","CORE_BUILD"];
const pending = evaluateCoreOfflineReadiness(null);
assert.equal(pending.decision,"NO_GO");
assert.equal(pending.missing.length,6);
const complete = evaluateCoreOfflineReadiness(Object.fromEntries(names.map(x=>[x,true])));
assert.equal(complete.decision,"OFFLINE_REVIEW_READY_ONLY");
assert.deepEqual(complete.missing,[]);
for(const review of [
  complete,pending,evaluateCoreOfflineReadiness({
    C51:true,C52:true,C53:true,C54:true,CORE_TESTS:true,CORE_BUILD:true,
    productionAuthorized:true,mergeAuthorized:true,liveDataReadsAuthorized:true,
  } as unknown as Record<CoreOfflineGate,boolean>),
]){
  assert.equal(review.productionAuthorized,false);
  assert.equal(review.mergeAuthorized,false);
  assert.equal(review.pushAuthorized,false);
  assert.equal(review.deploymentAuthorized,false);
  assert.equal(review.liveDataReadsAuthorized,false);
  assert.equal(review.migrationAuthorized,false);
  assert.equal(review.mayProvisionIdentity,false);
  assert.equal(review.evidenceIndependentlyVerified,false);
}
const incomplete = evaluateCoreOfflineReadiness({C51:true,C52:true,C54:true,CORE_TESTS:true,CORE_BUILD:true});
assert.deepEqual(incomplete.missing,["C53"]);
console.log("C55 review packet cannot convert offline tests into Production or merge approval.");
