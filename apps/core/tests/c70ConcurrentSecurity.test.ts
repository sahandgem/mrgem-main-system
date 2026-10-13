import assert from "node:assert/strict";
import {CommandCenterRuntime} from "../src/integration/commandCenter/commandCenterRuntime.ts";
import {CommandCenterMockDataSource} from "../src/integration/commandCenter/commandCenterMockDataSource.ts";
const view=await new CommandCenterMockDataSource().read("2026-10-12T09:00:00.000Z");
let doneFirst!:(v:typeof view)=>void,doneSecond!:(v:typeof view)=>void;
let reads=0;
const runtime=new CommandCenterRuntime({sourceKind:"mock",read:async()=>new Promise<typeof view>(resolve=>{
 reads++; if(reads===1)doneFirst=resolve; else doneSecond=resolve;
})});
const first=runtime.refresh("2026-10-12T09:00:00.000Z");
const second=runtime.refresh("2026-10-12T09:01:00.000Z");
doneSecond({...view,generatedAt:"2026-10-12T09:01:00.000Z"});
assert.equal(await second,"success");
doneFirst(view);
assert.equal(await first,"superseded");
assert.equal(runtime.getState().lastSuccessfulAt,"2026-10-12T09:01:00.000Z");
runtime.invalidate();
assert.equal(runtime.getState().viewModel,undefined);
console.log("C70 overlapping reads, late response and revocation PASS");
