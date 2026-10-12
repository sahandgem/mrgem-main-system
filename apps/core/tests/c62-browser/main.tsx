// A disposable browser fixture. Not referenced by the production entry.
import {createRoot} from "react-dom/client";
import {CommandCenterModuleOverview} from "../../src/components/CommandCenterModuleOverview";
import {CommandCenterRuntime} from "../../src/integration/commandCenter/commandCenterRuntime";
import {CommandCenterLiveDataSource} from "../../src/integration/commandCenter/commandCenterLiveDataSource";
import {fridayMarketRegistryEntry} from "../../src/integration/registry/moduleRegistry";
import {buildMockObservation} from "../../src/integration/adapters/mockModuleAdapter";
import "../../src/styles.css";

const stats={connections:0, reads:0, externalRequests:0};
let connected=false;
const entry=fridayMarketRegistryEntry("#module-finance-friday-market");
const source=new CommandCenterLiveDataSource({
 enabled:true, registry:[],
 extension:()=>connected ? {
  entries:[entry],
  adapters:{[entry.adapterKey]:{
    adapterKey:entry.adapterKey,moduleId:entry.moduleId,
    async read(){
      stats.reads++;
      const raw=buildMockObservation("workforce.demo",new Date().toISOString());
      return {kind:"data" as const,raw:{
        ...raw, observationId:"fixture-friday-market",
        module:{...raw.module,moduleId:entry.moduleId,moduleType:"finance",displayName:"جمعه‌بازار"},
        summary:{status:"healthy",text:"داده ساختگی جمعه‌بازار"},
        alerts:[], kpis:[], ownership:{...raw.ownership,businessTruthOwner:"synthetic/friday-market"},
      }};
    },
  }},
 } : null,
});
const environment={
 sourceMode:"live" as const,
 runtime:new CommandCenterRuntime(source),
 fridayMarket:{
  available:()=>true,
  connected:()=>connected,
  async connect(){stats.connections++;connected=true;return true;},
 },
};
Object.defineProperty(window,"__C62_TEST__",{value:stats});
createRoot(document.getElementById("root")!).render(
 <div className="core-shell"><CommandCenterModuleOverview runtimeEnvironmentFactory={()=>environment}/></div>
);
