import assert from "node:assert/strict";
import {createOptInFridayMarketRuntimeEnvironment,createCommandCenterRuntimeEnvironment} from "../src/integration/commandCenter/commandCenterRuntimeEnvironment.ts";
assert.equal(createCommandCenterRuntimeEnvironment().fridayMarket,undefined);
const disabled=createOptInFridayMarketRuntimeEnvironment({enabled:false,registry:[]});
assert.equal(disabled.fridayMarket?.available(),false);
assert.equal(disabled.fridayMarket?.connected(),false);
disabled.fridayMarket?.disconnect();
assert.equal(await disabled.fridayMarket?.connect(),false);
console.log("C68 explicit only connection and local disconnect PASS");
