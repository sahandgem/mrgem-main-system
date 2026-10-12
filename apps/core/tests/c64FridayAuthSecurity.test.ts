import assert from "node:assert/strict";
import {clearFridayMarketAccessToken,getFridayMarketAccessToken,validFridayMarketToken,verifyFridayMarketBridgeAccess} from "../src/integration/fridayMarketConnection.ts";
assert.equal(validFridayMarketToken("a".repeat(20)),true);
assert.equal(validFridayMarketToken("a".repeat(8192)),true);
for(const input of [null,42,"short","a b"+"a".repeat(30),"a".repeat(8193),"a\n"+"b".repeat(40)])assert.equal(validFridayMarketToken(input),false);
clearFridayMarketAccessToken();
assert.equal(getFridayMarketAccessToken(),null);
assert.equal(await verifyFridayMarketBridgeAccess("short","data:application/json,%7B%22ok%22%3Atrue%7D"),false);
console.log("C64 bounded token and closed invalid-access checks PASS.");
