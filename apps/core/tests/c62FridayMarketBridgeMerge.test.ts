import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HttpModuleAdapter } from "../src/integration/adapters/httpModuleAdapter.ts";
import { fridayMarketRegistryEntry } from "../src/integration/registry/moduleRegistry.ts";
import { CommandCenterLiveDataSource } from "../src/integration/commandCenter/commandCenterLiveDataSource.ts";
import { createCommandCenterRuntimeEnvironment, createOptInFridayMarketRuntimeEnvironment } from "../src/integration/commandCenter/commandCenterRuntimeEnvironment.ts";
import { verifyFridayMarketBridgeAccess } from "../src/integration/fridayMarketConnection.ts";

const now="2026-08-07T09:30:00.000Z";
const detailUrl="https://audit-app.example/friday-market";
const entry=fridayMarketRegistryEntry(detailUrl);
const payload={
 contractVersion:"1.0.0",observationId:"friday-market:synthetic",
 module:{moduleId:entry.moduleId,displayName:"جمعه‌بازار",moduleType:"finance",contractVersion:"1.0.0",
 producerVersion:"synthetic",sourceSystem:"audit-app",environment:"test"},
 generatedAt:now,summary:{status:"attention",text:"۱ اقدام، ۱ بینش"},
 health:{state:"healthy",observedAt:now},
 kpis:[{key:"friday_market_insight_sales",label:"تغییر فروش",value:"بینش روندی",
 valueType:"text",status:"info",measuredAt:now,
 comparison:{direction:"unknown",label:"تغییر از آستانه مصوب عبور کرده است."},
 drillDownRef:detailUrl}],
 alerts:[{alertId:"settlement-1",category:"friday_market_action_settlement",severity:"warning",
 title:"تسویه باز",summary:"یک تسویه هنوز باز است.",detectedAt:now,status:"open",
 recommendedNextAction:"بررسی تسویه",drillDownRef:detailUrl}],
 capabilities:[{key:"friday_market_read",version:"1",mode:"read",status:"available"}],
 ownership:{businessTruthOwner:"audit-app/friday-market",isDerived:true},
};
let requests=0, token:string|null=null, connected=false;
const adapter=new HttpModuleAdapter(entry.moduleId,entry.adapterKey,"/synthetic/friday-market",
 async (_url,init)=>{
  requests++;
  assert.equal(new Headers(init?.headers).get("Authorization"),"Bearer synthetic-valid-token");
  assert.equal(init?.method,"GET");
  return new Response(JSON.stringify(payload),{status:200,headers:{"Content-Type":"application/json"}});
 },()=>token);
const extension=()=>connected?{entries:[entry],adapters:{[entry.adapterKey]:adapter}}:null;
const source=new CommandCenterLiveDataSource({enabled:true,registry:[],extension});
let view=await source.read(now);
assert.equal(view.dataLabel,"LIVE/READ-ONLY");
assert.equal(view.modules.length,0);
assert.equal(requests,0);
connected=true;
view=await source.read(now);
assert.equal(view.modules[0]?.reliability,"unavailable"); // Token is required even for opted-in adapter.
assert.equal(requests,0);
token="synthetic-valid-token";
view=await source.read(now);
assert.equal(requests,1);
assert.equal(view.modules.find(m=>m.moduleId===entry.moduleId)?.reliability,"fresh");
assert.equal(view.modules.find(m=>m.moduleId===entry.moduleId)?.isExperimental,false);
assert.equal(view.topAttention.find(x=>x.moduleId===entry.moduleId)?.suggestedNextStep,"بررسی تسویه");
assert.equal(view.kpiHighlights.find(x=>x.moduleId===entry.moduleId)?.drillDownRef,detailUrl);
token=null;
view=await source.read(now);
assert.equal(view.modules[0]?.reliability,"unavailable");
assert.equal(requests,1);
connected=false;
view=await source.read(now);
assert.equal(view.modules.length,0);
assert.equal(requests,1);
let attempted=0;
const closed=new CommandCenterLiveDataSource({
 enabled:false,registry:[],extension:()=>{attempted++;return {entries:[entry],adapters:{[entry.adapterKey]:adapter}};},
});
await assert.rejects(()=>closed.read(now),/disabled/);
assert.equal(attempted,0);
assert.equal(createCommandCenterRuntimeEnvironment().sourceMode,"mock");
assert.equal(createCommandCenterRuntimeEnvironment().fridayMarket,undefined);
assert.equal(createCommandCenterRuntimeEnvironment({mode:"live"}).fridayMarket,undefined);
const disabled=createOptInFridayMarketRuntimeEnvironment({enabled:false,registry:[]});
assert.equal(disabled.fridayMarket?.available(),false);
assert.equal(await disabled.fridayMarket?.connect(),false);
assert.equal(disabled.fridayMarket?.connected(),false);
assert.equal(await verifyFridayMarketBridgeAccess("synthetic-valid-token",
 "data:application/json,%7B%22ok%22%3Atrue%7D"),true);
assert.equal(await verifyFridayMarketBridgeAccess("",
 "data:application/json,%7B%22ok%22%3Atrue%7D"),false);
const component=readFileSync(fileURLToPath(new URL("../src/components/CommandCenterModuleOverview.tsx",import.meta.url)),"utf8");
assert.match(component,/runtimeEnvironment\.sourceMode === "live" \? runtimeEnvironment\.fridayMarket : undefined/);
const auth=readFileSync(fileURLToPath(new URL("../src/components/auth/CoreAuthBoundary.tsx",import.meta.url)),"utf8");
assert.match(auth,/clearFridayMarketAccessToken\(\)/);
console.log("Friday Market opt-in live bridge, read-only HTTP, no-token guard and manager isolation PASS.");
