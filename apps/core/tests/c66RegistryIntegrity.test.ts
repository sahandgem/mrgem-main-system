import assert from "node:assert/strict";
import {CommandCenterLiveDataSource} from "../src/integration/commandCenter/commandCenterLiveDataSource.ts";
import {integrationModuleRegistry} from "../src/integration/registry/moduleRegistry.ts";
import {MockModuleAdapter} from "../src/integration/adapters/mockModuleAdapter.ts";
const entry=integrationModuleRegistry[0];
const adapter=new MockModuleAdapter(entry.moduleId,entry.adapterKey);
let readCount=0;
const dup=new CommandCenterLiveDataSource({enabled:true,registry:[entry],adapters:{[entry.adapterKey]:adapter},extension:()=>({
 entries:[entry],adapters:{[entry.adapterKey]:{moduleId:entry.moduleId,adapterKey:entry.adapterKey,async read(){readCount++;return {kind:"no_data" as const};}}}
})});
await assert.rejects(()=>dup.read(),/DUPLICATE_MODULE_EXTENSION/);
assert.equal(readCount,0);
const missing=new CommandCenterLiveDataSource({enabled:true,registry:[],extension:()=>({entries:[entry],adapters:{}})});
await assert.rejects(()=>missing.read(),/MISSING_MODULE_ADAPTER/);
const closed=new CommandCenterLiveDataSource({enabled:false,registry:[],extension:()=>{readCount++;return {entries:[],adapters:{}};}});
await assert.rejects(()=>closed.read());
assert.equal(readCount,0);
console.log("C66 duplicate module keys, incomplete extension, closed gate PASS");
