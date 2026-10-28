import test from 'node:test';
import assert from 'node:assert/strict';
import {createTwitchBridge} from '../twitch.mjs';
import {createDemoServer} from '../server.mjs';

class MockSocket extends EventTarget {
 constructor(url){super();this.url=url;this.isClosed=false;}
 sendPacket(p){this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(p)}));}
 close(){this.isClosed=true;this.dispatchEvent(new Event('close'));}
}
const creds={
 TWITCH_CLIENT_ID:'client-1',TWITCH_ACCESS_TOKEN:'secret-mock-123',
 TWITCH_BROADCASTER_ID:'1000',TWITCH_READER_ID:'1000'
};
function mockBridge(){
 const sockets=[],requests=[],events=[],statuses=[];
 const request=async(url,options)=>{
   requests.push({url,options});
   if(url.includes('/validate'))return {ok:true,json:async()=>({client_id:'client-1',user_id:'1000',scopes:['user:read:chat']})};
   if(url.includes('/subscriptions'))return {ok:true,status:202};
   throw Error('unexpected network');
 };
 const bridge=createTwitchBridge({env:creds,request,
   socketFactory:url=>{const ws=new MockSocket(url);sockets.push(ws);return ws;},
   emit:(event,data)=>events.push({event,data}),onStatus:x=>statuses.push(x),retryMs:100});
 return {bridge,sockets,requests,events,statuses};
}
const welcome=(id='session123')=>({metadata:{message_type:'session_welcome'},payload:{session:{id,keepalive_timeout_seconds:20}}});
test('Twitch EventSub connects with user scope, subscribes to chat and incoming raids',async()=>{
 const m=mockBridge();m.bridge.start();await new Promise(resolve=>setTimeout(resolve,10));assert.equal(m.sockets.length,1);
 m.sockets[0].sendPacket(welcome());
 await new Promise(resolve=>setTimeout(resolve,15));
 const subs=m.requests.filter(x=>x.url.includes('/subscriptions')).map(x=>JSON.parse(x.options.body));
 assert.deepEqual(subs.map(s=>s.type),['channel.chat.message','channel.raid']);
 assert.equal(subs[0].transport.session_id,'session123');
 assert.equal(subs[0].condition.broadcaster_user_id,'1000');
 assert.equal(m.bridge.getStatus().connected,true);
 m.sockets[0].sendPacket({metadata:{message_type:'notification',message_id:'evt1'},
   payload:{subscription:{type:'channel.chat.message'},event:{broadcaster_user_id:'1000',chatter_user_id:'42',chatter_user_name:'Nora',message_id:'msg1',message:{text:'proteggilo!'}}}});
 m.sockets[0].sendPacket({metadata:{message_type:'notification',message_id:'evt1'},
   payload:{subscription:{type:'channel.chat.message'},event:{broadcaster_user_id:'1000',chatter_user_name:'Nora',message:{text:'duplicate'}}}});
 m.sockets[0].sendPacket({metadata:{message_type:'notification',message_id:'evt2'},
   payload:{subscription:{type:'channel.raid'},event:{to_broadcaster_user_id:'1000',from_broadcaster_user_name:'RaidLeader',viewers:137}}});
 assert.equal(m.events.length,2);
 assert.deepEqual(m.events.map(x=>x.event),['chat','raid']);
 assert.equal(m.events[0].data.user,'Nora');
 assert.equal(m.events[1].data.viewers,137);
 assert.equal(m.events[0].data.text,'proteggilo!');
 m.bridge.stop();
});
test('without Twitch credentials no connection nor secrets are exposed',async()=>{
 let sockets=0;
 const b=createTwitchBridge({env:{},socketFactory:()=>{sockets++;return new MockSocket('');}});
 b.start();assert.equal(sockets,0);assert.equal(b.getStatus().connected,false);b.stop();
});
test('web server serves full demo, SSE streams Twitch messages, denies source files',async()=>{
 let onStatus,emit;
 const bFactory=o=>{onStatus=o.onStatus;emit=o.emit;return {start(){onStatus({mode:'DEMO',connected:false,detail:'Test simulation'});},stop(){}};};
 const app=createDemoServer({host:'127.0.0.1',port:0,env:{},bridgeFactory:bFactory});
 try{
  await new Promise(resolve=>app.server.once('listening',resolve));
  const base='http://127.0.0.1:'+app.server.address().port;
  const [home,secret,status]=await Promise.all([fetch(base),fetch(base+'/twitch.mjs'),fetch(base+'/api/status')]);
  assert.equal(home.status,200);
  const html=await home.text();
  assert.match(html,/THE CROWD/);assert.match(html,/EventSource/);
  assert.equal(secret.status,404);
  assert.deepEqual((await status.json()).connected,false);
  const ac=new AbortController();
  const stream=await fetch(base+'/events',{signal:ac.signal});
  assert.equal(stream.status,200);
  const reader=stream.body.getReader();
  const initial=new TextDecoder().decode((await reader.read()).value);
  assert.match(initial,/event: status/);
  emit('chat',{source:'twitch',user:'Tester',text:'salvalo',messageId:'evt-test'});
  const second=new TextDecoder().decode((await reader.read()).value);
  assert.match(second,/event: chat/);assert.match(second,/salvalo/);
  await reader.cancel();ac.abort();
  const post=await fetch(base+'/api/status',{method:'POST'});
  assert.equal(post.status,405);
 }finally{await app.close();}
});
