/** Twitch EventSub WebSocket bridge. No browser-side secrets. */
const URL='wss://eventsub.wss.twitch.tv/ws';
const ID=/^\d{1,30}$/;
const tidy=v=>String(v||'').trim();
export function createTwitchBridge({env=process.env,emit=()=>{},onStatus=()=>{},request=fetch,socketFactory=url=>new WebSocket(url),retryMs=5000}={}){
 const clientId=tidy(env.TWITCH_CLIENT_ID),token=tidy(env.TWITCH_ACCESS_TOKEN).replace(/^oauth:/i,'');
 const broadcasterId=tidy(env.TWITCH_BROADCASTER_ID),readerId=tidy(env.TWITCH_READER_ID);
 const configured=Boolean(clientId&&token&&broadcasterId&&readerId);
 const partial=Boolean(clientId||token||broadcasterId||readerId);
 let socket=null,closed=false,retryTimer,watchdog,validated=false,connected=false,backoff=retryMs;
 const seen=new Set();
 const status=(detail,isConnected=false)=>{connected=isConnected;onStatus({mode:configured?'TWITCH':'DEMO',connected,detail});};
 const dedup=id=>{if(!id||seen.has(id))return false;seen.add(id);if(seen.size>2048)seen.delete(seen.values().next().value);return true;};
 async function validate(){
   const response=await request('https://id.twitch.tv/oauth2/validate',{headers:{Authorization:'OAuth '+token},signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error('Twitch OAuth validation returned HTTP '+response.status);
   const data=await response.json();
   if(data.client_id!==clientId)throw Error('OAuth client ID does not match Twitch app');
   if(String(data.user_id)!==readerId)throw Error('TWITCH_READER_ID differs from OAuth account');
   if(!Array.isArray(data.scopes)||!data.scopes.includes('user:read:chat'))throw Error('Missing user:read:chat permission');
   return true;
 }
 async function subscribe(type,condition,sessionId){
   const response=await request('https://api.twitch.tv/helix/eventsub/subscriptions',{
     method:'POST',headers:{Authorization:'Bearer '+token,'Client-Id':clientId,'Content-Type':'application/json'},
     body:JSON.stringify({type,version:'1',condition,transport:{method:'websocket',session_id:sessionId}}),
     signal:AbortSignal.timeout(8500)
   });
   if(!response.ok){
     let detail='';try{const e=await response.json();detail=e.message||'';}catch{}
     throw Error('EventSub '+type+' rejected: HTTP '+response.status+(detail?' '+detail.slice(0,150):''));
   }
 }
 function resetWatchdog(seconds=35){
   clearTimeout(watchdog);
   watchdog=setTimeout(()=>{status('Twitch connection timed out; reconnecting');try{socket?.close();}catch{}},Math.max(10,seconds+8)*1000);
   watchdog.unref?.();
 }
 function scheduleRetry(){
   if(closed)return;
   clearTimeout(retryTimer);
   retryTimer=setTimeout(async()=>{try{if(!validated){await validate();validated=true;}connect();}catch(e){status('OAuth validation: '+e.message);scheduleRetry();}},backoff);
   retryTimer.unref?.();
   backoff=Math.min(backoff*2,60000);
 }
 function connect(url=URL,transfer=false){
   if(closed)return;
   clearTimeout(retryTimer);
   let ws;try{ws=socketFactory(url);}catch(error){status('WebSocket failed: '+error.message);scheduleRetry();return;}
   const previous=socket;socket=ws;
   ws.addEventListener('message',async evt=>{
     if(closed||socket!==ws)return;
     let p;try{p=JSON.parse(typeof evt.data==='string'?evt.data:String(evt.data));}catch{return;}
     const type=p.metadata?.message_type;
     if(type==='session_welcome'){
       const session=p.payload?.session;if(!session?.id){ws.close();return;}
       resetWatchdog(Number(session.keepalive_timeout_seconds)||30);
       if(transfer){status('Twitch reconnected',true);try{previous?.close();}catch{};return;}
       try{
         if(!validated)throw Error('Twitch OAuth validation pending');
         await subscribe('channel.chat.message',{broadcaster_user_id:broadcasterId,user_id:readerId},session.id);
         status('Twitch chat connected',true);
         try{await subscribe('channel.raid',{to_broadcaster_user_id:broadcasterId},session.id);}
         catch(error){status('Chat online; raid subscription failed: '+error.message,true);}
         backoff=retryMs;
       }catch(error){status(error.message);ws.close();}
     }else if(type==='session_keepalive'){resetWatchdog();}
     else if(type==='session_reconnect'){
       const next=p.payload?.session?.reconnect_url;
       if(next&&next.startsWith(URL)){connect(next,true);}
       else ws.close();
     }else if(type==='notification'){
       resetWatchdog();
       const eventId=tidy(p.metadata?.message_id);
       if(!dedup(eventId))return;
       const sub=p.payload?.subscription?.type,info=p.payload?.event;
       if(sub==='channel.chat.message'&&info?.broadcaster_user_id===broadcasterId&&typeof info.message?.text==='string'){
         emit('chat',{user:tidy(info.chatter_user_name).slice(0,40)||'viewer',text:info.message.text.slice(0,160),
           userId:tidy(info.chatter_user_id).slice(0,50),messageId:tidy(info.message_id||eventId).slice(0,100),source:'twitch'});
       }else if(sub==='channel.raid'&&info?.to_broadcaster_user_id===broadcasterId){
         emit('raid',{viewers:Math.max(1,Math.min(10000,Math.trunc(Number(info.viewers)||1))),from:tidy(info.from_broadcaster_user_name).slice(0,48),
           messageId:eventId,source:'twitch'});
       }
     }else if(type==='revocation'){validated=false;status('Twitch revoked the subscription');ws.close();}
   });
   ws.addEventListener('close',()=>{
     clearTimeout(watchdog);
     if(closed||socket!==ws)return;
     socket=null;status('Twitch disconnected; reconnecting');scheduleRetry();
   });
   ws.addEventListener('error',()=>{if(socket===ws)status('Twitch WebSocket error');});
 }
 function start(){
   if(!configured){status(partial?'Twitch config incomplete (four environment variables)':'Simulated chat; Twitch not connected');return;}
   if(!ID.test(broadcasterId)||!ID.test(readerId)){status('Twitch IDs must be numeric');return;}
   status('Validating Twitch OAuth');
   void validate().then(()=>{validated=true;status('Connecting to Twitch EventSub');connect();}).catch(error=>{status(error.message);scheduleRetry();});
 }
 function stop(){closed=true;clearTimeout(retryTimer);clearTimeout(watchdog);const ws=socket;socket=null;try{ws?.close();}catch{}}
 return {configured,start,stop,getStatus:()=>({configured,connected})};
}
