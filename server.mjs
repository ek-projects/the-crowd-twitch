import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join,resolve} from 'node:path';
import {createTwitchBridge} from './twitch.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const assets=new Map([['/','index.html'],['/index.html','index.html'],['/download/the-crowd-v0.3.zip','THE_CROWD_v0.3.zip'],['/download/hackathon-bundle.zip','THE_CROWD_HACKATHON_v0.3.zip']]);
export function createDemoServer({host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||3107),env=process.env,bridgeFactory=createTwitchBridge}={}){
 if(!Number.isInteger(port)||port<0||port>65535)throw RangeError('Invalid port');
 const clients=new Set();
 let status={mode:'DEMO',connected:false,detail:'Simulated chat; Twitch not connected'};
 const push=(res,event,data)=>{
   if(res.destroyed||res.writableEnded)return;
   if(res.writableLength>65536){res.destroy();return;}
   res.write('event: '+event+'\ndata: '+JSON.stringify(data)+'\n\n');
 };
 const broadcast=(event,data)=>{for(const res of clients)push(res,event,data);};
 const bridge=bridgeFactory({env,onStatus:s=>{status=s;broadcast('status',s);},emit:(event,data)=>broadcast(event,data)});
 const server=createServer(async(req,res)=>{
   res.setHeader('X-Content-Type-Options','nosniff');
   res.setHeader('Referrer-Policy','no-referrer');
   res.setHeader('Cache-Control','no-store');
   res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method Not Allowed');return;}
   const path=new URL(req.url,'http://localhost').pathname;
   if(path==='/api/status'){
     res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});
     res.end(req.method==='HEAD'?undefined:JSON.stringify({...status,source:'twitch-eventsub-or-simulation'}));return;
   }
   if(path==='/events'){
     const origin=req.headers.origin;
     if(origin){try{if(new URL(origin).host!==req.headers.host)throw Error('bad origin');}catch{res.writeHead(403);res.end();return;}}
     if(clients.size>=32){res.writeHead(503);res.end();return;}
     res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','X-Accel-Buffering':'no','Connection':'keep-alive'});
     if(req.method==='HEAD'){res.end();return;}
     clients.add(res);push(res,'status',status);res.on('close',()=>clients.delete(res));return;
   }
   const file=assets.get(path);
   if(!file){res.writeHead(404);res.end('Not Found');return;}
   try{
     const page=await readFile(join(root,file));
     res.writeHead(200,{'Content-Type':file.endsWith('.zip')?'application/zip':'text/html; charset=utf-8','Content-Length':page.length,'Content-Disposition':file.endsWith('.zip')?'attachment; filename=THE_CROWD_v0.3.zip':'inline'});
     res.end(req.method==='HEAD'?undefined:page);
   }catch{res.writeHead(500);res.end('Server Error');}
 });
 const heartbeat=setInterval(()=>broadcast('heartbeat',{at:Date.now()}),18000);
 heartbeat.unref();
 server.listen(port,host,()=>bridge.start());
 async function close(){
   bridge.stop();clearInterval(heartbeat);for(const res of clients)res.end();
   return new Promise((resolveClose,reject)=>server.close(e=>e?reject(e):resolveClose()));
 }
 return {server,bridge,close,getStatus:()=>status,broadcast};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const app=createDemoServer();
 app.server.on('listening',()=>console.log('THE CROWD listening at '+app.server.address().address+':'+app.server.address().port));
 app.server.on('error',e=>{console.error(e.message);process.exitCode=1;});
 for(const sig of ['SIGTERM','SIGINT'])process.once(sig,()=>void app.close());
}
