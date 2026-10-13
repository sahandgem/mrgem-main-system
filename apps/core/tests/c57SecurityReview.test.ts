import assert from "node:assert/strict";
import {createSupabaseBrowserAuthAdapter} from "../src/integration/auth/supabaseBrowserAuthAdapter.ts";
import {createAuthenticatedBffJsonReader,AuthenticatedBffReadError} from "../src/integration/transports/authenticatedBffRequest.ts";
import {createClosedCoreAuthProvider} from "../src/integration/auth/coreAuthProvider.ts";

const token1="c57-synthetic-access-token-aaaaaaaaaaaaaaaa";
const token2="c57-synthetic-access-token-bbbbbbbbbbbbbbbb";
const cred={email:"pilot@example.test",password:"synthetic-password"};
function deferred<T>() {
 let resolve!: (value:T)=>void;
 const promise=new Promise<T>(r=>{resolve=r;});
 return {promise,resolve};
}
{
 const realNow=Date.now;
 try {
  Date.now=()=>10_000_000;
  let callback:(event:string,session:any)=>void=()=>{};
  const expiry=10_100;
  const session={access_token:token1,expires_at:expiry,user:{email:cred.email}};
  const auth=createSupabaseBrowserAuthAdapter({client:{auth:{
    async getSession(){return {data:{session}};},
    async signInWithPassword(){return {data:{session},error:null};},
    async signOut(){return {error:null};},
    onAuthStateChange(fn){callback=fn;return {data:{subscription:{unsubscribe(){}}}};},
  }}});
  await auth.initialize();
  assert.equal(await auth.getAccessToken(),token1);
  Date.now=()=>10_200_000;
  assert.equal(await auth.getAccessToken(),null,"expires during an active session");
  assert.equal(auth.getSnapshot().phase,"unauthenticated");
  callback("UNEXPECTED_EVENT",session);
  assert.notEqual(auth.getSnapshot().phase,"authenticated");
  auth.dispose();
 } finally {Date.now=realNow;}
}
{
 let cb:(event:string,session:any)=>void=()=>{};
 const auth=createSupabaseBrowserAuthAdapter({client:{auth:{
  async getSession(){return {data:{session:null}};},
  async signInWithPassword(){return {error:{message:"C57_PRIVATE"}};},
  async signOut(){return {error:null};},
  onAuthStateChange(fn){cb=fn;return {data:{subscription:{unsubscribe(){}}}};},
 }}});
 await auth.initialize();
 assert.equal((await auth.signIn(cred)).status,"rejected");
 cb("SIGNED_IN",{access_token:token1,user:{email:cred.email}});
 assert.equal(auth.getSnapshot().phase,"error");
 assert.equal(await auth.getAccessToken(),null);
 auth.dispose();
}
{
 const pending=deferred<{statusCode:number;body:unknown}>();
 const started=deferred<void>();
 let active:string|null=token1,logoutCount=0;
 const provider={...createClosedCoreAuthProvider(),kind:"trusted" as const,
  async getAccessToken(){return active;},
  async signOut(){logoutCount++;active=null;},
 };
 const reader=createAuthenticatedBffJsonReader({authProvider:provider,path:"/api/command-center/testing",
  executor:{execute(){started.resolve();return pending.promise;}}});
 const read=reader.read();
 await started.promise;
 active=null;
 pending.resolve({statusCode:200,body:{private:"NEVER_RETURN"}});
 await assert.rejects(read,(error:unknown)=>error instanceof AuthenticatedBffReadError&&error.category==="unauthorized");
 assert.equal(logoutCount,0);
}
{
 const pending=deferred<{statusCode:number;body:unknown}>();
 const started=deferred<void>();
 let active:string|null=token1,logoutCount=0;
 const provider={...createClosedCoreAuthProvider(),kind:"trusted" as const,
  async getAccessToken(){return active;},
  async signOut(){logoutCount++;active=null;},
 };
 const reader=createAuthenticatedBffJsonReader({authProvider:provider,path:"/api/command-center/testing",
  executor:{execute(){started.resolve();return pending.promise;}}});
 const read=reader.read();
 await started.promise;
 active=token2;
 pending.resolve({statusCode:200,body:{private:"STALE_ROTATED"}});
 await assert.rejects(read,(error:unknown)=>error instanceof AuthenticatedBffReadError&&error.category==="unauthorized");
 assert.equal(active,token2);
 assert.equal(logoutCount,0);
}
console.log("C57 expired session, failed-login callback and stale 200 BFF response hardened.");
