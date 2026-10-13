import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdtemp,rm} from "node:fs/promises";
import path from "node:path";
import os from "node:os";
const base=process.argv[2];
if(base!=="http://127.0.0.1:5176/")throw Error("C62_LOCAL_ONLY");
const profile=await mkdtemp(path.join(os.tmpdir(),"core-c62-"));
const port=10500+(process.pid%3500);
const browser=spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",[
 "--headless=new","--disable-gpu","--no-first-run","--remote-debugging-port="+port,
 "--user-data-dir="+profile,"about:blank",
],{stdio:"ignore"});
const sleep=n=>new Promise(r=>setTimeout(r,n));
const lookup=async(url,opt)=>{for(let i=0;i<90;i++){
 try {const r=await fetch(url,opt);if(r.ok)return r.json();} catch {}
 await sleep(140);
}throw Error("C62_BROWSER_TIMEOUT");};
try{
 await lookup("http://127.0.0.1:"+port+"/json/version");
 const target=await lookup("http://127.0.0.1:"+port+"/json/new?"+encodeURIComponent(base+"tests/c62-browser/index.html"),{method:"PUT"});
 const ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((yes,no)=>{ws.addEventListener("open",yes,{once:true});ws.addEventListener("error",no,{once:true});});
 let id=0;const pending=new Map(),exceptions=[];
 ws.addEventListener("message",e=>{
  const x=JSON.parse(e.data);
  if(x.id&&pending.has(x.id)){const {yes,no}=pending.get(x.id);pending.delete(x.id);x.error?no(Error("C62_CDP")):yes(x.result);}
  else if(x.method==="Runtime.exceptionThrown")exceptions.push(x.params?.exceptionDetails?.text+" "+x.params?.exceptionDetails?.exception?.description);
 });
 const send=(method,params={})=>new Promise((yes,no)=>{const n=++id;pending.set(n,{yes,no});ws.send(JSON.stringify({id:n,method,params}));});
 const evaluate=async expression=>{const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error("C62_JS_EXCEPTION");return r.result?.value;};
 const wait=async expr=>{for(let i=0;i<95;i++){if(await evaluate(expr))return;await sleep(125);}throw Error("C62_WAIT: "+expr+" body="+JSON.stringify(await evaluate("document.body.innerText.slice(0,400)"))+" exceptions="+JSON.stringify(exceptions));};
 await send("Runtime.enable");await send("Page.enable");
 await wait("!!document.querySelector('.cockpit-system-bar')");
 await wait("Array.from(document.querySelectorAll('button')).some(b=>b.textContent?.includes('اتصال حسابداری'))");
 assert.equal(await evaluate("window.__C62_TEST__.connections"),0);
 await evaluate("Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('اتصال حسابداری')).click();true");
 await wait("document.body.innerText.includes('حسابداری متصل')");
 assert.equal(await evaluate("window.__C62_TEST__.connections"),1);
 assert.equal(await evaluate("window.__C62_TEST__.reads"),1);
 assert.equal(await evaluate("window.__C62_TEST__.externalRequests"),0);
 assert.deepEqual(exceptions,[]);
 console.log(JSON.stringify({phase:"C62",status:"PASS",checks:["opt-in control visible","synthetic click transitions to connected","finance read once","no external network","no JavaScript exceptions"],realData:false},null,2));
 ws.close();
}finally{
 if(browser.exitCode===null)browser.kill("SIGKILL");
 await Promise.race([new Promise(r=>browser.once("exit",r)),sleep(3000)]);
 await rm(profile,{recursive:true,force:true,maxRetries:8,retryDelay:300});
}
