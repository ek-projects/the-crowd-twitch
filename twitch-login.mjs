/**
 * Device authorization helper:
 * node twitch-login.mjs <Twitch client ID>
 * Uses only user:read:chat. Never prints tokens.
 */
import {writeFile,chmod} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const clientId=process.argv[2];
if(!clientId||!(/^[a-z0-9]{8,64}$/i).test(clientId)){
 console.error('Usage: node twitch-login.mjs CLIENT_ID (from dev.twitch.tv/console/apps)');
 process.exitCode=1;
}else{
 const post=(url,params)=>fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:new URLSearchParams(params),signal:AbortSignal.timeout(10000)});
 try{
   const scope='user:read:chat';
   const response=await post('https://id.twitch.tv/oauth2/device',{client_id:clientId,scopes:scope});
   if(!response.ok)throw Error('Twitch device authorization request failed: HTTP '+response.status);
   const info=await response.json();
   if(!info.device_code||!info.verification_uri||!info.user_code)throw Error('Incomplete device response');
   console.log('\nOpen this official Twitch verification address on your phone or computer:');
   console.log(info.verification_uri);
   console.log('Code: '+info.user_code);
   console.log('Approve only the read-chat permission. Never paste access tokens into ChatGPT.');
   const deadline=Date.now()+Math.min(1800,Math.max(60,Number(info.expires_in)||900))*1000;
   let interval=Math.max(5,Number(info.interval)||5)*1000,auth;
   while(Date.now()<deadline){
     await delay(interval);
     const r=await post('https://id.twitch.tv/oauth2/token',{client_id:clientId,scopes:scope,
       device_code:info.device_code,grant_type:'urn:ietf:params:oauth:grant-type:device_code'});
     const data=await r.json();
     if(r.ok&&data.access_token){auth=data;break;}
     if(data.message==='authorization_pending'||data.error==='authorization_pending')continue;
     if(data.message==='slow_down'){interval+=5000;continue;}
     throw Error('Twitch auth rejected: '+String(data.message||data.error||r.status).slice(0,150));
   }
   if(!auth)throw Error('Authorization expired; run again');
   const valid=await fetch('https://id.twitch.tv/oauth2/validate',
     {headers:{Authorization:'OAuth '+auth.access_token},signal:AbortSignal.timeout(10000)});
   if(!valid.ok)throw Error('OAuth token validation failed');
   const profile=await valid.json();
   if(profile.client_id!==clientId||!profile.scopes?.includes(scope)||!/^\d+$/.test(String(profile.user_id||'')))
     throw Error('Twitch account, client ID or permission mismatch');
   const dir=dirname(fileURLToPath(import.meta.url));
   const content=['TWITCH_CLIENT_ID='+clientId,'TWITCH_ACCESS_TOKEN='+auth.access_token,
     'TWITCH_BROADCASTER_ID='+profile.user_id,'TWITCH_READER_ID='+profile.user_id].join('\n')+'\n';
   const path=join(dir,'.env');
   await writeFile(path,content,{mode:0o600});await chmod(path,0o600);
   console.log('\nAuthorization complete for @'+String(profile.login||'channel'));
   console.log('Credentials stored locally in a private .env file (mode 0600).');
   console.log('Run: node --env-file=.env server.mjs');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
