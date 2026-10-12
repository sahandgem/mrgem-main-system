import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdtemp,rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
const base=process.argv[2];
if(base!=="http://127.0.0.1:5176/")throw Error("C54_LOOPBACK_ONLY");
const profile=await mkdtemp(path.join(os.tmpdir(),"core-c54-"));
const port=10200+process.pid%3500;
const chrome=spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",[
  "--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check",
  "--remote-debugging-port="+port,"--user-data-dir="+profile,"about:blank"
],{stdio:"ignore"});
const sleep=n=>new Promise(r=>setTimeout(r,n));
const lookup=async(url,opt)=>{for(let i=0;i<75;i++){try{const r=await fetch(url,opt);if(r.ok)return r.json();}catch{}await sleep(120);}throw Error("C54_CHROME_TIMEOUT");};
try{
  await lookup("http://127.0.0.1:"+port+"/json/version");
  const target=await lookup("http://127.0.0.1:"+port+"/json/new?"+encodeURIComponent(base+"__dev/command-center"),{method:"PUT"});
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((yes,no)=>{ws.addEventListener("open",yes,{once:true});ws.addEventListener("error",no,{once:true});});
  let id=0;const waiting=new Map();const exceptions=[];
  ws.addEventListener("message",evt=>{
    const m=JSON.parse(evt.data);
    if(m.id&&waiting.has(m.id)){const {yes,no}=waiting.get(m.id);waiting.delete(m.id);m.error?no(Error("C54_CDP_FAILED")):yes(m.result);}
    else if(m.method==="Runtime.exceptionThrown")exceptions.push("page exception");
  });
  const send=(method,params={})=>new Promise((yes,no)=>{const seq=++id;waiting.set(seq,{yes,no});ws.send(JSON.stringify({id:seq,method,params}));});
  const evaluate=async expression=>{const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error("C54_EVALUATE_FAILED");return r.result.value;};
  const wait=async expr=>{for(let i=0;i<100;i++){if(await evaluate(expr))return;await sleep(110);}throw Error("C54_WAIT_FAILED "+expr);};
  await send("Runtime.enable");await send("Page.enable");
  const checks=[];
  for(const [width,height] of [[1365,768],[1440,800],[720,900],[420,800]]){
    await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<=720,screenWidth:width,screenHeight:height});
    await send("Page.navigate",{url:base+"__dev/command-center"});
    await wait("!!document.querySelector('.command-row')");
    const x=await evaluate("({scroll:document.documentElement.scrollWidth,inner:innerWidth})");
    assert.ok(x.scroll<=x.inner+2,"C54 horizontal overflow "+width+" "+JSON.stringify(x));
    assert.equal(await evaluate("document.querySelectorAll('.cockpit-drawer').length"),0);
    checks.push(width+"x"+height+": cockpit no horizontal overflow");
    if(width===1365||width===420){
      await evaluate("document.querySelector('.command-row').focus();document.querySelector('.command-row').click();true");
      await wait("document.querySelectorAll('.cockpit-drawer[role=dialog]').length===1");
      await send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
      await send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
      await wait("!document.querySelector('.cockpit-drawer')");
      await wait("document.activeElement?.classList.contains('command-row')");
      checks.push(width+"px: one detail panel, Escape and focus restore");
    }
  }
  await send("Page.navigate",{url:base});
  await wait("!!document.querySelector('#core-login-title')");
  assert.equal(await evaluate("!!document.querySelector('.cockpit-stage')"),false);
  checks.push("manager entry is closed; no demo cockpit");
  assert.deepEqual(exceptions,[]);
  checks.push("no JavaScript exceptions");
  console.log(JSON.stringify({phase:"C54",result:"PASS",checks,synthetic:true},null,2));
  ws.close();
}finally{
  if(chrome.exitCode===null)chrome.kill("SIGKILL");
  await Promise.race([new Promise(r=>chrome.once("exit",r)),sleep(3500)]);
  await rm(profile,{recursive:true,force:true,maxRetries:12,retryDelay:350});
}
