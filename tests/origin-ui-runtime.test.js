import test from 'node:test';
import assert from 'node:assert/strict';

class Element {
  constructor(){this.textContent='';this.children=[];this.handlers={};}
  append(child){this.children.push(child);}
  replaceChildren(){this.children=[];}
  addEventListener(kind,handler){this.handlers[kind]=handler;}
  click(){this.handlers.click?.();}
}
test('the browser scene dispatches a complete Crossing through the same kernel',async()=>{
 const ids=['#place','#scene','#detail','#actions','#error','#inventory','#stage','#chapter','#moment','#choicePrompt','#choiceHint','#keepsakes','#artLabel'];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const data=new Map();
 globalThis.document={querySelector(id){return elements[id]},createElement(){return new Element()}};
 globalThis.localStorage={getItem:key=>data.get(key)??null,setItem:(key,val)=>data.set(key,val),removeItem:key=>data.delete(key)};
 await import('../origin/app.js');
 assert.equal(elements['#place'].textContent,'THE PORCH');
 assert.match(elements['#chapter'].textContent,/THE KNOCK/);
 assert.match(elements['#choicePrompt'].textContent,/notice|door/i);
 assert.match(elements['#keepsakes'].textContent,/Bell/i);
 assert.match(elements['#stage'].className,/mood-porch/);
 for(const kind of ['DETECT','OPEN','REQUEST_ADMISSION','CONFIRM','DEPART','ARRIVE','SEAL']){
  assert.ok(elements['#actions'].children.length>0,`No action button at ${kind}`);
  elements['#actions'].children[0].click();
  assert.equal(elements['#error'].textContent,'',`Unexpected error at ${kind}`);
 }
 assert.equal(elements['#place'].textContent,'FOREIGN ROOM');
 assert.match(elements['#chapter'].textContent,/THE TABLE/);
 assert.match(elements['#stage'].className,/mood-room/);
 assert.match(elements['#scene'].textContent,/You are late to something/);
 const raw=data.get('static-collective:origin-first-crossing-001');
 assert.match(raw,/"crossingStatus": "CROSSED"/);
 assert.match(raw,/does_not_resolve_bell_cause/);
 assert.ok(elements['#actions'].children.some(button=>/Stay at the door/.test(button.textContent)));
 elements['#actions'].children.find(button=>/Stay at the door/.test(button.textContent)).click();
 assert.match(elements['#scene'].textContent,/door/i);
 assert.match(elements['#choicePrompt'].textContent,/listen|room/i);
 elements['#actions'].children.find(button=>/Listen/.test(button.textContent)).click();
 assert.match(elements['#detail'].textContent,/reported|another house/i);
 elements['#actions'].children.find(button=>/Inspect/.test(button.textContent)).click();
 assert.match(elements['#detail'].textContent,/not an invitation/i);
 assert.match(elements['#chapter'].textContent,/ANOTHER HOUSE/);
 assert.match(elements['#stage'].className,/mood-rumor/);
 assert.match(data.get('static-collective:origin-first-crossing-001'),/table.address_inspected/);
 assert.ok(elements['#actions'].children.some(button=>/Foreign Room exit offer/.test(button.textContent)));
 elements['#actions'].children.find(button=>/Foreign Room exit offer/.test(button.textContent)).click();
 assert.match(elements['#detail'].textContent,/Grace has NOT admitted/);
 assert.match(elements['#choicePrompt'].textContent,/hold|wait/i);
 assert.match(data.get('static-collective:origin-first-crossing-001'),/gate.exit_offered/);
 assert.match(data.get('static-collective:origin-first-crossing-001'),/FOREIGN ROOM|foreign-room-seed-001/);
 assert.equal(elements['#place'].textContent,'FOREIGN ROOM');
 assert.match(elements['#chapter'].textContent,/AN OFFER/);
 assert.match(elements['#stage'].className,/mood-offer/);
});
