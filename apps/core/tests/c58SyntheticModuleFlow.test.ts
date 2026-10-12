import assert from "node:assert/strict";
import { MockModuleAdapter } from "../src/integration/adapters/mockModuleAdapter.ts";
import { CommandCenterLiveDataSource } from "../src/integration/commandCenter/commandCenterLiveDataSource.ts";
import { CommandCenterRuntime } from "../src/integration/commandCenter/commandCenterRuntime.ts";
import { integrationModuleRegistry } from "../src/integration/registry/moduleRegistry.ts";
import { findPrimaryCommandCenterModule } from "../src/integration/commandCenter/commandCenterViewModel.ts";
const at="2026-08-07T09:00:00.000Z";

function scenario(workforce:"healthy"|"partial_kpi"|"unavailable"|"malformed"|"no_data",production:"healthy"|"stale"|"malformed"|"unavailable"|"no_data") {
 const workforceAdapter=new MockModuleAdapter("workforce.demo","mock.workforce",workforce);
 const productionAdapter=new MockModuleAdapter("production.demo","mock.production",production);
 workforceAdapter.setGeneratedAt(at);
 productionAdapter.setGeneratedAt(production==="stale"?"2026-08-06T00:00:00.000Z":at);
 const adapters={"mock.workforce":workforceAdapter,"mock.production":productionAdapter};
 const source=new CommandCenterLiveDataSource({enabled:true,registry:integrationModuleRegistry,adapters});
 return {source,workforceAdapter,productionAdapter};
}
{
 const {source,workforceAdapter,productionAdapter}=scenario("healthy","healthy");
 const runtime=new CommandCenterRuntime(source);
 assert.equal(await runtime.refresh(at),"success");
 const view=runtime.getState().viewModel!;
 assert.equal(view.dataLabel,"LIVE/READ-ONLY");
 assert.equal(view.modules.length,2);
 assert.ok(findPrimaryCommandCenterModule(view.modules,"workforce"));
 assert.ok(findPrimaryCommandCenterModule(view.modules,"production")?.isExperimental);
 assert.ok(view.topAttention.every(x=>view.modules.some(m=>m.moduleId===x.moduleId)));
 assert.equal(workforceAdapter.getReadCount(),1);
 assert.equal(productionAdapter.getReadCount(),1);
}
{
 const {source}=scenario("partial_kpi","stale");
 const view=await source.read(at);
 assert.equal(view.reliability.hasPartialData,true);
 assert.equal(findPrimaryCommandCenterModule(view.modules,"workforce")?.isPartialData,true);
 assert.equal(findPrimaryCommandCenterModule(view.modules,"production")?.reliability,"stale_last_known_good");
 assert.equal(view.overallState==="healthy",false);
}
{
 const {source}=scenario("unavailable","healthy");
 const view=await source.read(at);
 assert.equal(findPrimaryCommandCenterModule(view.modules,"workforce")?.reliability,"unavailable");
 assert.equal(findPrimaryCommandCenterModule(view.modules,"production")?.reliability,"fresh");
 assert.equal(view.reliability.failedModuleCount>0,true);
}
{
 const {source}=scenario("malformed","no_data");
 const view=await source.read(at);
 assert.equal(findPrimaryCommandCenterModule(view.modules,"workforce")?.reliability,"invalid");
 assert.equal(findPrimaryCommandCenterModule(view.modules,"production")?.reliability,"no_data");
 assert.equal(view.overallState==="healthy",false);
}
{
 // Registry duplicate must not be silently counted as a second healthy module.
 const adapter=new MockModuleAdapter("workforce.demo","mock.workforce","healthy");
 adapter.setGeneratedAt(at);
 const entry=integrationModuleRegistry[0];
 const source=new CommandCenterLiveDataSource({enabled:true,registry:[entry,{...entry}],adapters:{"mock.workforce":adapter}});
 const view=await source.read(at);
 assert.equal(view.modules.length,2);
 assert.equal(view.modules.every(x=>x.reliability==="invalid"),true);
 assert.equal(adapter.getReadCount(),0);
}
{
 // Closed live gate does not read even a synthetic adapter.
 const {workforceAdapter,productionAdapter}=scenario("healthy","healthy");
 const source=new CommandCenterLiveDataSource({enabled:false,adapters:{"mock.workforce":workforceAdapter,"mock.production":productionAdapter}});
 await assert.rejects(()=>source.read(at));
 assert.equal(workforceAdapter.getReadCount(),0);
 assert.equal(productionAdapter.getReadCount(),0);
}
console.log("C58 synthetic Workforce + Production aggregation contract boundary passed.");
